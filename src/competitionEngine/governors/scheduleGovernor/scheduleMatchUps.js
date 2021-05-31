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
 * @param {object} individualParticipantProfiles - { [participantId]: { limits }}
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
  matchUps, // optional - pass in copmetitionMatchUps to avoid repetitive fetch on recursive use

  periodLength = 30,
  averageMatchUpMinutes = 90,
  recoveryMinutes = 0,

  matchUpDailyLimits = {},
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

  if (!matchUps) {
    const { matchUps: competitionMatchUps } = allCompetitionMatchUps({
      tournamentRecords,
      nextMatchUps: true,
    });
    matchUps = competitionMatchUps.filter(({ matchUpId }) =>
      matchUpIds.includes(matchUpId)
    );
  }

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

  const matchUpNotBeforeTimes = {}; // this should be built from existing matchUps scheduled on the date
  const individualParticipantProfiles = {}; // this should be built from existing matchUps scheduled on the date
  const dateScheduledMatchUps = matchUps.filter(({ matchUpId }) =>
    dateScheduledMatchUpIds.includes(matchUpId)
  );
  dateScheduledMatchUps.forEach((matchUp) => {
    // TODO: pre-populate individualParticipantProfiles from already scheduled matchUps
    const scheduleTime = matchUp.schedule?.scheduledTime;
    if (scheduleTime) {
      const timeAfterRecovery = addMinutesToTimeString(
        scheduleTime,
        parseInt(averageMatchUpMinutes) + parseInt(recoveryMinutes)
      );
      if (matchUp.winnerTo?.matchUpId)
        matchUpNotBeforeTimes[matchUp.winnerTo.matchUpId] = timeAfterRecovery;
      if (matchUp.loserTo?.matchUpId)
        matchUpNotBeforeTimes[matchUp.loserTo.matchUpId] = timeAfterRecovery;
    }
  });

  // TODO: Also filter out matchUps which are already scheduled on the date
  // matchUps are assumed to be in the desired order for scheduling
  let matchUpsToSchedule = matchUps.filter((matchUp) => {
    const doNotSchedule = [
      BYE,
      DEFAULTED,
      COMPLETED,
      ABANDONED,
      RETIRED,
      WALKOVER,
    ].includes(matchUp?.matchUpStatus);
    return !matchUp?.winningSide && !doNotSchedule;
  });

  if (!matchUpsToSchedule?.length) return { error: 'Nothing to schedule' };
  if (!scheduleTimes?.length) return { error: 'No schedule times available' };

  // for optimization, build up an object for each tournament and an array for each draw with target matchUps
  // keep track of matchUps counts per participant and don't add matchUps for participants beyond those limits
  const { matchUpMap, skippedMatchUpIds } = matchUpsToSchedule.reduce(
    (aggregator, matchUp) => {
      const { drawId, tournamentId } = matchUp;

      const participantIdsAtLimit = checkDailyLimits(
        matchUp,
        matchUpDailyLimits,
        individualParticipantProfiles
      );
      if (participantIdsAtLimit?.length) {
        aggregator.skippedMatchUpIds.push({
          matchUpId: matchUp.matchUpId,
          participantIdsAtLimit,
        });
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
    { matchUpMap: {}, skippedMatchUpIds: [] }
  );

  let deferredMatchUps = [];
  const unusedScheduleTimes = [];
  const matchUpScheduleTimes = {};

  let iterations = 0;
  const failSafe = scheduleTimes.length;

  // while there are still matchUps to schedule and scheduleTimes, assign scheduleTimes to matchUps;
  while (
    scheduleTimes.length &&
    deferredMatchUps.length + matchUpsToSchedule.length &&
    iterations <= failSafe
  ) {
    iterations++;
    const insufficientTimeMatchUps = [];
    const { scheduleTime } = scheduleTimes.shift();

    // find a matchUp where all individual participants had enough recovery time
    const candidateMatchUps = [...deferredMatchUps, ...matchUpsToSchedule];
    const scheduledMatchUp = candidateMatchUps.find((matchUp) => {
      const { enoughTime } = checkRecoveryTime(
        matchUp,
        scheduleTime,
        recoveryMinutes,
        averageMatchUpMinutes,
        individualParticipantProfiles,
        matchUpNotBeforeTimes
      );

      if (enoughTime) {
        matchUpScheduleTimes[matchUp.matchUpId] = scheduleTime;
        return true;
      } else {
        insufficientTimeMatchUps.push(matchUp);
      }
    });

    // rebuild deferredMatchUps and matchUpsToSchedule arrays
    deferredMatchUps = insufficientTimeMatchUps
      .concat(...deferredMatchUps)
      .filter(({ matchUpId }) => matchUpId !== scheduledMatchUp?.matchUpId);
    matchUpsToSchedule = matchUpsToSchedule.filter(
      ({ matchUpId }) => matchUpId !== scheduledMatchUp?.matchUpId
    );

    if (!scheduledMatchUp) {
      unusedScheduleTimes.push(scheduleTime);
    }
  }

  const matchUpsNotScheduled = deferredMatchUps.concat(...matchUpsToSchedule);
  matchUpsNotScheduled.forEach((matchUp) => {
    decrementParticipantMatchUpsCounts(matchUp, individualParticipantProfiles);
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

  return Object.assign({}, SUCCESS, {
    skippedMatchUpIds,
    scheduledMatchUpIds,
    matchUpNotBeforeTimes,
    individualParticipantProfiles,
  });
}

export function checkRecoveryTime(
  matchUp,
  scheduleTime,
  recoveryMinutes,
  averageMatchUpMinutes,
  matchUpNotBeforeTimes,
  individualParticipantProfiles
) {
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
      } else {
        individualParticipantProfiles[participantId] = {
          limits: {},
          timeAfterRecovery: undefined,
        };
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
      individualParticipantProfiles[participantId].timeAfterRecovery =
        timeAfterRecovery;
    });
  }

  return { enoughTime };
}

/**
 *
 * @param {object[]} sides - matchUp.sides
 * @param {string} matchUpType - SINGLES, DOUBLES, TEAM
 * @param {object} matchUpDailyLimits - { SINGLES, DOUBLES, TOTAL } - counters
 * @param {object} individualParticipantProfiles - participantIds are attributes { [participantId]: { limits: { SINGLES, DOUBLES, TOTAL }}}
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
            (profile.limits && profile.limits[counterName]) || 0;
          const dailyLimit = matchUpDailyLimits[counterName];
          return (
            participantCount && dailyLimit && participantCount >= dailyLimit
          );
        });
        return limitReached;
      } else {
        individualParticipantProfiles[participantId] = {
          limits: {},
          timeAfterRecovery: undefined,
        };
      }
    }
  );

  if (!participantIdsAtLimit) {
    individualParticipantIds.forEach((participantId) => {
      const limits = individualParticipantProfiles[participantId].limits;
      if (limits[matchUpType]) limits[matchUpType] += 1;
      else limits[matchUpType] = 1;
      if (limits[TOTAL]) limits[TOTAL] += 1;
      else limits[TOTAL] = 1;
    });
  }

  return participantIdsAtLimit;
}

function decrementParticipantMatchUpsCounts(
  matchUp,
  individualParticipantProfiles
) {
  const { matchUpType } = matchUp;
  const individualParticipantIds = getIndividualParticipantIds(matchUp);
  individualParticipantIds.forEach((participantId) => {
    const limits = individualParticipantProfiles[participantId].limits;
    if (limits[matchUpType]) limits[matchUpType] -= 1;
    if (limits[TOTAL]) limits[TOTAL] -= 1;
  });
}

function getIndividualParticipantIds(matchUp) {
  const { sides, matchUpType } = matchUp;
  return (sides || [])
    .map((side) => {
      return matchUpType === DOUBLES
        ? side?.individualParticipantIds || []
        : side.participantId
        ? [side.participantId]
        : [];
    })
    .flat();
}
