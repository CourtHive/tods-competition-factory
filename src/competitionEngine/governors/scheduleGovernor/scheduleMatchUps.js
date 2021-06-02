import { assignMatchUpVenue } from '../../../tournamentEngine/governors/scheduleGovernor/assignMatchUpVenue';
import { addMatchUpScheduledTime } from '../../../drawEngine/governors/matchUpGovernor/scheduleItems';
import { getDrawDefinition } from '../../../tournamentEngine/getters/eventGetter';
import { allCompetitionMatchUps } from '../../getters/matchUpsGetter';
import { calculateScheduleTimes } from './calculateScheduleTimes';
import { getDevContext } from '../../../global/globalState';
import {
  addMinutesToTimeString,
  extractDate,
  extractTime,
  isValidDateString,
  minutesDifference,
  timeToDate,
  zeroPad,
} from '../../../utilities/dateTime';

import {
  MISSING_TOURNAMENT_RECORDS,
  MISSING_TOURNAMENT_ID,
  MISSING_MATCHUP_IDS,
  INVALID_DATE,
  INVALID_VALUES,
} from '../../../constants/errorConditionConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import {
  BYE,
  ABANDONED,
  DEFAULTED,
  RETIRED,
  WALKOVER,
  COMPLETED,
} from '../../../constants/matchUpStatusConstants';
import { DOUBLES } from '../../../constants/matchUpTypes';
import { TOTAL } from '../../../constants/scheduleConstants';
import { intersection } from '../../../utilities';

/**
 *
 * @param {object[]} tournamentRecords - provided by competitionEngine
 * @param {string[]} matchUpIds - matchUpIds to schedule
 * @param {string[]} venueIds - venueIds of venues where dateAvailability for courts is found
 * @param {string} date - YYYY-MM-DD string representing day on which matchUps should be scheduled
 * @param {string} startTime - 00:00 - military time string
 * @param {string} endTime - 00:00 - military time string
 *
 * @param {number} periodLength - granularity of time blocks to consider, in minutes
 * @param {number} averageMatchUpMinutes - how long the expected matchUps are expected to last, in minutes, on average
 * @param {number} recoveryMinutes - time in minutes that should be alloted for participants to recover between matches
 * @param {object} matchUpDailyLimits - { SINGLES, DOUBLES, TOTAL } - maximum number of matches allowed per participant
 * @param {object} individualParticipantProfiles - { [participantId]: { counters }}
 *
 * @returns scheduledMatchUpIds, individualParticipantProfiles
 * @modifies individualParticipantProfiles - increments counters
 */
export function scheduleMatchUps({
  tournamentRecords,
  matchUpIds,
  venueIds,

  date,
  startTime,
  endTime,

  periodLength = 30,
  averageMatchUpMinutes = 90,
  recoveryMinutes = 0,

  matchUpDailyLimits = {},
  preserveScheduling,
}) {
  if (!tournamentRecords) return { error: MISSING_TOURNAMENT_RECORDS };
  if (!matchUpIds) return { error: MISSING_MATCHUP_IDS };
  if (!isValidDateString(date)) return { error: INVALID_DATE };
  if (
    isNaN(periodLength) ||
    isNaN(averageMatchUpMinutes) ||
    isNaN(recoveryMinutes)
  )
    return { error: INVALID_VALUES };

  const { matchUps: competitionMatchUps } = allCompetitionMatchUps({
    tournamentRecords,
    nextMatchUps: true,
  });
  const targetMatchUps = competitionMatchUps.filter(({ matchUpId }) =>
    matchUpIds.includes(matchUpId)
  );

  // determines court availability taking into account already scheduled matchUps on the date
  // optimization to pass already retrieved competitionMatchUps to avoid refetch (requires refactor)
  const { venueId, scheduleTimes, dateScheduledMatchUpIds } =
    calculateScheduleTimes({
      tournamentRecords,
      startTime: extractTime(startTime),
      endTime: extractTime(endTime),
      date: extractDate(date),
      averageMatchUpMinutes,
      periodLength,
      venueIds,
    });

  // built from existing matchUps scheduled on the date
  const matchUpNotBeforeTimes = {};
  const individualParticipantProfiles = {};
  const matchUpPotentialParticipantIds = {};

  const dateScheduledMatchUps = competitionMatchUps.filter(({ matchUpId }) =>
    dateScheduledMatchUpIds.includes(matchUpId)
  );
  dateScheduledMatchUps.forEach((matchUp) => {
    modifyParticipantMatchUpsCount({
      matchUpPotentialParticipantIds,
      individualParticipantProfiles,
      matchUp,
      value: 1,
    });
    const scheduleTime = matchUp.schedule?.scheduledTime;
    if (scheduleTime) {
      const timeAfterRecovery = addMinutesToTimeString(
        scheduleTime,
        parseInt(averageMatchUpMinutes) + parseInt(recoveryMinutes)
      );
      processNextMatchUps({
        matchUp,
        timeAfterRecovery,
        matchUpNotBeforeTimes,
        matchUpPotentialParticipantIds,
      });
    }
  });

  // matchUps are assumed to be in the desired order for scheduling
  let matchUpsToSchedule = targetMatchUps.filter((matchUp) => {
    const alreadyScheduled =
      preserveScheduling && dateScheduledMatchUpIds.includes(matchUp.matchUpId);

    const doNotSchedule = [
      BYE,
      DEFAULTED,
      COMPLETED,
      ABANDONED,
      RETIRED,
      WALKOVER,
    ].includes(matchUp?.matchUpStatus);
    return !alreadyScheduled && !matchUp?.winningSide && !doNotSchedule;
  });

  // for optimization, build up an object for each tournament and an array for each draw with target matchUps
  // keep track of matchUps counts per participant and don't add matchUps for participants beyond those limits
  const { matchUpMap, overLimitMatchUpIds, participantIdsAtLimit } =
    matchUpsToSchedule.reduce(
      (aggregator, matchUp) => {
        const { drawId, tournamentId } = matchUp;

        const participantIdsAtLimit = checkDailyLimits(
          matchUp,
          matchUpDailyLimits,
          individualParticipantProfiles
        );
        if (participantIdsAtLimit?.length) {
          aggregator.overLimitMatchUpIds.push(matchUp.matchUpId);
          aggregator.participantIdsAtLimit.push(...participantIdsAtLimit);
          return aggregator;
        }

        if (!aggregator.matchUpMap[tournamentId])
          aggregator.matchUpMap[tournamentId] = {};
        if (!aggregator.matchUpMap[tournamentId][drawId]) {
          aggregator.matchUpMap[tournamentId][drawId] = [matchUp];
        } else {
          aggregator.matchUpMap[tournamentId][drawId].push(matchUp);
        }

        return aggregator;
      },
      { matchUpMap: {}, overLimitMatchUpIds: [], participantIdsAtLimit: [] }
    );

  matchUpsToSchedule = matchUpsToSchedule.filter(
    ({ matchUpId }) => !overLimitMatchUpIds.includes(matchUpId)
  );

  const unusedScheduleTimes = [];
  const matchUpScheduleTimes = {};

  let iterations = 0;
  const failSafe = scheduleTimes?.length || 0;

  // while there are still matchUps to schedule and scheduleTimes, assign scheduleTimes to matchUps;
  while (
    scheduleTimes?.length &&
    matchUpsToSchedule.length &&
    iterations <= failSafe
  ) {
    iterations++;
    const { scheduleTime } = scheduleTimes.shift();

    // find a matchUp where all individual participants had enough recovery time
    const scheduledMatchUp = matchUpsToSchedule.find((matchUp) => {
      const { enoughTime } = checkRecoveryTime({
        matchUp,
        scheduleTime,
        recoveryMinutes,
        averageMatchUpMinutes,
        individualParticipantProfiles,
        matchUpNotBeforeTimes,
        matchUpPotentialParticipantIds,
      });

      if (enoughTime) {
        matchUpScheduleTimes[matchUp.matchUpId] = scheduleTime;
        return true;
      }
    });

    matchUpsToSchedule = matchUpsToSchedule.filter(
      ({ matchUpId }) => matchUpId !== scheduledMatchUp?.matchUpId
    );

    if (!scheduledMatchUp) {
      unusedScheduleTimes.push(scheduleTime);
    }
  }

  // cleanup limits counters for matchUps which could not be scheduled due to recovery times
  matchUpsToSchedule.forEach((matchUp) => {
    modifyParticipantMatchUpsCount({
      individualParticipantProfiles,
      matchUpPotentialParticipantIds,
      value: -1,
      matchUp,
    });
  });

  let scheduledMatchUpIds = [];
  Object.keys(matchUpMap).forEach((tournamentId) => {
    const tournamentRecord = tournamentRecords[tournamentId];
    if (tournamentRecord) {
      Object.keys(matchUpMap[tournamentId]).forEach((drawId) => {
        const { drawDefinition } = getDrawDefinition({
          tournamentRecord,
          drawId,
        });
        if (drawDefinition) {
          const drawMatchUps = matchUpMap[tournamentId][drawId];
          drawMatchUps.forEach(({ matchUpId }) => {
            const scheduleTime = matchUpScheduleTimes[matchUpId];
            if (scheduleTime) {
              // must include date being scheduled to generate proper ISO string
              const formatTime = scheduleTime.split(':').map(zeroPad).join(':');
              const scheduledTime = `${extractDate(date)}T${formatTime}`;

              const result = addMatchUpScheduledTime({
                drawDefinition,
                matchUpId,
                scheduledTime,
              });
              if (result.success)
                scheduledMatchUpIds.push({
                  drawId,
                  matchUpId,
                  scheduledTime,
                });

              if (venueId) {
                assignMatchUpVenue({
                  tournamentRecord,
                  drawDefinition,
                  matchUpId,
                  venueId,
                });
              }
            }
          });
        }
      });
    } else {
      if (getDevContext()) console.log(MISSING_TOURNAMENT_ID);
    }
  });

  const noTimeMatchUpIds = matchUpsToSchedule.map(({ matchUpId }) => matchUpId);

  return Object.assign({}, SUCCESS, {
    noTimeMatchUpIds,
    overLimitMatchUpIds,
    scheduledMatchUpIds,
    matchUpNotBeforeTimes,
    participantIdsAtLimit,
    individualParticipantProfiles,
  });
}

export function checkRecoveryTime({
  matchUp,
  scheduleTime,
  recoveryMinutes,
  averageMatchUpMinutes,
  individualParticipantProfiles,
  matchUpNotBeforeTimes,
  matchUpPotentialParticipantIds,
}) {
  const individualParticipantIds = getIndividualParticipantIds(matchUp);
  const sufficientTimeForIndiiduals = individualParticipantIds.reduce(
    (isSufficient, participantId) => {
      const profile = individualParticipantProfiles[participantId];
      if (profile) {
        if (!profile.timeAfterRecovery) return isSufficient && true;
        const timeBetween = minutesDifference(
          timeToDate(profile.timeAfterRecovery),
          timeToDate(scheduleTime),
          false
        );
        if (timeBetween < 0) return false;
      }
      return isSufficient;
    },
    true
  );

  const notBeforeTime = matchUpNotBeforeTimes[matchUp.matchUpId];
  const timeBetweenMatchUps = notBeforeTime
    ? minutesDifference(
        timeToDate(notBeforeTime),
        timeToDate(scheduleTime),
        false
      )
    : 0;
  const sufficientTimeBetweenMatchUps = timeBetweenMatchUps >= 0;

  const enoughTime =
    sufficientTimeForIndiiduals && sufficientTimeBetweenMatchUps;

  if (enoughTime) {
    individualParticipantIds.forEach((participantId) => {
      const timeAfterRecovery = addMinutesToTimeString(
        scheduleTime,
        parseInt(averageMatchUpMinutes) + parseInt(recoveryMinutes)
      );
      if (!individualParticipantProfiles[participantId]) {
        individualParticipantProfiles[participantId] = {
          timeAfterRecovery,
        };
      } else {
        individualParticipantProfiles[participantId].timeAfterRecovery =
          timeAfterRecovery;
      }

      processNextMatchUps({
        matchUp,
        timeAfterRecovery,
        matchUpNotBeforeTimes,
        matchUpPotentialParticipantIds,
      });
    });
  }

  return { enoughTime };
}

/**
 *
 * @param {object[]} sides - matchUp.sides
 * @param {string} matchUpType - SINGLES, DOUBLES, TEAM
 * @param {object} matchUpDailyLimits - { SINGLES, DOUBLES, TOTAL } - counters
 * @param {object} individualParticipantProfiles - participantIds are attributes { [participantId]: { counters: { SINGLES, DOUBLES, TOTAL }}}
 * @returns {string[]} participantIdsAtLimit - array of participantIds who are at or beyond daily matchUp limit
 * @modifies individualParticipantProfiles - increments counters
 */
function checkDailyLimits(
  matchUp,
  matchUpDailyLimits,
  individualParticipantProfiles
) {
  const { matchUpType } = matchUp;
  const individualParticipantIds = getIndividualParticipantIds(matchUp);

  const participantIdsAtLimit = individualParticipantIds.filter(
    (participantId) => {
      const profile = individualParticipantProfiles[participantId];
      if (profile) {
        const limitReached = [matchUpType, TOTAL].find((counterName) => {
          const participantCount =
            (profile.counters && profile.counters[counterName]) || 0;
          const dailyLimit = matchUpDailyLimits[counterName];
          return (
            participantCount && dailyLimit && participantCount >= dailyLimit
          );
        });
        return limitReached;
      }
    }
  );

  if (!participantIdsAtLimit.length) {
    individualParticipantIds.forEach((participantId) => {
      if (!individualParticipantProfiles[participantId])
        individualParticipantProfiles[participantId] = { counters: {} };
      const counters = individualParticipantProfiles[participantId].counters;
      if (counters[matchUpType]) counters[matchUpType] += 1;
      else counters[matchUpType] = 1;
      if (counters[TOTAL]) counters[TOTAL] += 1;
      else counters[TOTAL] = 1;
    });
  }

  return participantIdsAtLimit;
}

function processNextMatchUps({
  matchUp,
  timeAfterRecovery,
  matchUpNotBeforeTimes,
  matchUpPotentialParticipantIds,
}) {
  const individualParticipantIds = getIndividualParticipantIds(matchUp);

  const addPotentialParticipantIds = (targetMatchUpId) => {
    if (!matchUpPotentialParticipantIds[targetMatchUpId])
      matchUpPotentialParticipantIds[targetMatchUpId] = [];

    // push potentials as an array so that if any have progressed to target matchUp
    // others in the array can be identfied as no longer potentials
    matchUpPotentialParticipantIds[targetMatchUpId].push(
      individualParticipantIds
    );
  };

  if (matchUp.winnerTo?.matchUpId) {
    matchUpNotBeforeTimes[matchUp.winnerTo.matchUpId] = timeAfterRecovery;
    addPotentialParticipantIds(matchUp.winnerTo.matchUpId);
  }
  if (matchUp.loserTo?.matchUpId) {
    matchUpNotBeforeTimes[matchUp.loserTo.matchUpId] = timeAfterRecovery;
    addPotentialParticipantIds(matchUp.loserTo.matchUpId);
  }
  if (matchUp.sidesTo?.length) {
    matchUp.sidesTo.forEach(({ matchUpId }) => {
      if (matchUpId) {
        matchUpNotBeforeTimes[matchUpId] = timeAfterRecovery;
        addPotentialParticipantIds(matchUpId);
      }
    });
  }
}

function modifyParticipantMatchUpsCount({
  matchUpPotentialParticipantIds,
  individualParticipantProfiles,
  matchUp,
  value,
}) {
  const { matchUpType } = matchUp;

  // individualParticipantIds represent those participants already present
  const individualParticipantIds = getIndividualParticipantIds(matchUp);
  // potentialParticipantIds are those who could progress to this matchUp
  const potentialParticipantIds =
    matchUpPotentialParticipantIds[matchUp.matchUpId] || [];

  // filteredPotentials exclude potentials if any of the participantIds
  // are present in individualParticipantIds which ensures that source match losers
  // do not get considered when incrementing or decrementing matchUp counters
  const filterdPotentials = potentialParticipantIds
    .filter(
      (potentials) => !intersection(potentials, individualParticipantIds).length
    )
    .flat();
  const consideredParticipantIds = [
    ...individualParticipantIds,
    ...filterdPotentials,
  ];

  consideredParticipantIds.forEach((participantId) => {
    if (!individualParticipantProfiles[participantId]) {
      individualParticipantProfiles[participantId] = { counters: {} };
    }
    const counters = individualParticipantProfiles[participantId].counters;
    if (counters[matchUpType]) counters[matchUpType] += value;
    else if (value > 0) counters[matchUpType] = value;
    if (counters[TOTAL]) counters[TOTAL] += value;
    else if (value > 0) counters[TOTAL] = value;
  });
}

function getIndividualParticipantIds(matchUp) {
  const { sides, matchUpType } = matchUp;
  return (sides || [])
    .map((side) => {
      return matchUpType === DOUBLES
        ? side?.participant?.individualParticipantIds || []
        : side.participantId
        ? [side.participantId]
        : [];
    })
    .flat();
}
