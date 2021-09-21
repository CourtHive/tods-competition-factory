import { assignMatchUpVenue } from '../../../../tournamentEngine/governors/scheduleGovernor/assignMatchUpVenue';
import { addMatchUpScheduledTime } from '../../../../drawEngine/governors/matchUpGovernor/scheduleItems';
import { getDrawDefinition } from '../../../../tournamentEngine/getters/eventGetter';
import { modifyParticipantMatchUpsCount } from './modifyParticipantMatchUpsCount';
import { checkDependenciesScheduled } from './checkDependenciesScheduled';
import { allCompetitionMatchUps } from '../../../getters/matchUpsGetter';
import { updateTimeAfterRecovery } from './updateTimeAfterRecovery';
import { calculateScheduleTimes } from './calculateScheduleTimes';
import { getMatchUpDependencies } from './getMatchUpDependencies';
import { checkRequestConflicts } from './checkRequestConflicts';
import { getDevContext } from '../../../../global/globalState';
import { processNextMatchUps } from './processNextMatchUps';
import { checkRecoveryTime } from './checkRecoveryTime';
import { checkDailyLimits } from './checkDailyLimits';
import { getPersonRequests } from './personRequests';
import {
  extractDate,
  extractTime,
  isValidDateString,
  sameDay,
  zeroPad,
} from '../../../../utilities/dateTime';

import { DO_NOT_SCHEDULE } from '../../../../constants/requestConstants';
import { SUCCESS } from '../../../../constants/resultConstants';
import {
  MISSING_TOURNAMENT_RECORDS,
  MISSING_TOURNAMENT_ID,
  MISSING_MATCHUP_IDS,
  INVALID_DATE,
  INVALID_VALUES,
} from '../../../../constants/errorConditionConstants';
import {
  BYE,
  ABANDONED,
  DEFAULTED,
  RETIRED,
  WALKOVER,
  COMPLETED,
} from '../../../../constants/matchUpStatusConstants';

/**
 *
 * @param {object[]} tournamentRecords - provided by competitionEngine
 * @param {string[]} matchUpIds - matchUpIds to schedule
 * @param {string[]} venueIds - venueIds of venues where dateAvailability for courts is found
 * @param {string} scheduleDate - YYYY-MM-DD string representing day on which matchUps should be scheduled
 * @param {string} startTime - 00:00 - military time string
 * @param {string} endTime - 00:00 - military time string
 *
 * @param {number} periodLength - granularity of time blocks to consider, in minutes
 * @param {number} averageMatchUpMinutes - how long the expected matchUps are expected to last, in minutes, on average
 * @param {number} recoveryMinutes - time in minutes that should be alloted for participants to recover between matches
 * @param {object} matchUpDailyLimits - { SINGLES, DOUBLES, TOTAL } - maximum number of matches allowed per participant
 * @param {boolean} checkPotentialRequestConflicts - check personRequests when person is only potentially in matchUp being scheduled
 *
 * @returns scheduledMatchUpIds, individualParticipantProfiles
 */
export function scheduleMatchUps({
  tournamentRecords,
  competitionMatchUps, // optimization for scheduleProfileRounds to pass this is as it has already processed
  matchUpDependencies, // optimization for scheduleProfileRounds to pass this is as it has already processed
  allDateMatchUpIds = [],

  averageMatchUpMinutes = 90,
  recoveryMinutes = 0,
  recoveryMinutesMap, // for matchUpIds batched by averageMatchUpMinutes this enables varying recoveryMinutes

  matchUpPotentialParticipantIds = {},
  individualParticipantProfiles = {},
  matchUpNotBeforeTimes = {},
  matchUpDailyLimits = {},

  checkPotentialRequestConflicts = true,
  remainingScheduleTimes,

  periodLength = 30,
  scheduleDate,
  matchUpIds,
  venueIds,

  startTime,
  endTime,
  dryRun,
}) {
  if (!tournamentRecords) return { error: MISSING_TOURNAMENT_RECORDS };
  if (!matchUpIds) return { error: MISSING_MATCHUP_IDS };
  if (!isValidDateString(scheduleDate)) return { error: INVALID_DATE };
  if (
    isNaN(periodLength) ||
    isNaN(averageMatchUpMinutes) ||
    isNaN(recoveryMinutes)
  )
    return { error: INVALID_VALUES };

  // if competitionMatchUps not provided as a parameter
  // scheduleMatchUpProfiles has already called processNextMatchUps for all
  if (!competitionMatchUps) {
    ({ matchUps: competitionMatchUps } = allCompetitionMatchUps({
      tournamentRecords,
      nextMatchUps: true,
    }));
  }

  if (!matchUpDependencies) {
    ({ matchUpDependencies } = getMatchUpDependencies({
      tournamentRecords,
      includeParticipantDependencies: true,
      matchUps: competitionMatchUps,
    }));
  }

  competitionMatchUps.forEach((matchUp) => {
    if (
      matchUp.schedule?.scheduledDate &&
      sameDay(scheduleDate, extractDate(matchUp.schedule.scheduledDate))
    ) {
      processNextMatchUps({
        matchUp,
        matchUpNotBeforeTimes,
        matchUpPotentialParticipantIds,
      });
    }
  });

  // this must be done to preserve the order of matchUpIds
  const targetMatchUps = matchUpIds
    .map((matchUpId) =>
      competitionMatchUps.find((matchUp) => matchUp.matchUpId === matchUpId)
    )
    .filter(Boolean);

  // determines court availability taking into account already scheduled matchUps on the scheduleDate
  // optimization to pass already retrieved competitionMatchUps to avoid refetch (requires refactor)
  const { venueId, scheduleTimes, dateScheduledMatchUpIds } =
    calculateScheduleTimes({
      tournamentRecords,
      remainingScheduleTimes,
      startTime: extractTime(startTime),
      endTime: extractTime(endTime),
      scheduleDate: extractDate(scheduleDate),
      averageMatchUpMinutes,
      periodLength,
      venueIds,
    });

  const requestConflicts = {};
  const skippedScheduleTimes = [];
  const matchUpScheduleTimes = {};

  // first build up a map of matchUpNotBeforeTimes and matchUpPotentialParticipantIds
  // based on already scheduled matchUps
  const dateScheduledMatchUps = competitionMatchUps.filter(({ matchUpId }) =>
    dateScheduledMatchUpIds.includes(matchUpId)
  );
  dateScheduledMatchUps.forEach((matchUp) => {
    modifyParticipantMatchUpsCount({
      matchUpPotentialParticipantIds,
      individualParticipantProfiles,
      scheduleDate,
      matchUp,
      value: 1,
    });
    const scheduleTime = matchUp.schedule?.scheduledTime;
    if (scheduleTime) {
      matchUpScheduleTimes[matchUp.matchUpId] = scheduleTime;
      const mappedRecoveryMinutes = recoveryMinutesMap?.[matchUp.matchUpId];
      updateTimeAfterRecovery({
        individualParticipantProfiles,
        matchUpPotentialParticipantIds,
        matchUpNotBeforeTimes,
        matchUpDependencies,

        recoveryMinutes: mappedRecoveryMinutes || recoveryMinutes,
        averageMatchUpMinutes,
        scheduleDate,
        scheduleTime,
        matchUp,
      });
    }
  });

  // matchUps are assumed to be in the desired order for scheduling
  let matchUpsToSchedule = targetMatchUps.filter((matchUp) => {
    const alreadyScheduled = dateScheduledMatchUpIds.includes(
      matchUp.matchUpId
    );

    const doNotSchedule = [
      BYE,
      DEFAULTED,
      COMPLETED,
      ABANDONED,
      RETIRED,
      WALKOVER,
    ].includes(matchUp?.matchUpStatus);
    return !alreadyScheduled && !matchUp.winningSide && !doNotSchedule;
  });

  // for optimization, build up an object for each tournament and an array for each draw with target matchUps
  // keep track of matchUps counts per participant and don't add matchUps for participants beyond those limits
  const { matchUpMap, overLimitMatchUpIds, participantIdsAtLimit } =
    matchUpsToSchedule.reduce(
      (aggregator, matchUp) => {
        const { drawId, tournamentId } = matchUp;

        const participantIdsAtLimit = checkDailyLimits(
          individualParticipantProfiles,
          matchUpPotentialParticipantIds,
          matchUpDailyLimits,
          scheduleDate,
          matchUp
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

        // since this matchUp is to be scheduled, update the matchUpPotentialParticipantIds
        processNextMatchUps({
          matchUp,
          matchUpNotBeforeTimes,
          matchUpPotentialParticipantIds,
        });

        return aggregator;
      },
      { matchUpMap: {}, overLimitMatchUpIds: [], participantIdsAtLimit: [] }
    );

  matchUpsToSchedule = matchUpsToSchedule.filter(
    ({ matchUpId }) => !overLimitMatchUpIds.includes(matchUpId)
  );

  let iterations = 0;
  const failSafe = scheduleTimes?.length || 0;

  const { personRequests } = getPersonRequests({
    tournamentRecords,
    requestType: DO_NOT_SCHEDULE,
  });

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
      const { dependenciesScheduled } = checkDependenciesScheduled({
        matchUps: competitionMatchUps,
        matchUpScheduleTimes,
        matchUpDependencies,
        allDateMatchUpIds,
        matchUp,
      });
      if (!dependenciesScheduled) return false;

      const { enoughTime } = checkRecoveryTime({
        individualParticipantProfiles,
        matchUpNotBeforeTimes,
        matchUpDependencies,
        scheduleTime,
        matchUp,
      });
      if (!enoughTime) return false;

      const { conflicts } = checkRequestConflicts({
        potentials: checkPotentialRequestConflicts,
        averageMatchUpMinutes,
        requestConflicts,
        personRequests,
        scheduleTime,
        scheduleDate,
        matchUp,
      });

      if (conflicts?.length) return false;

      const mappedRecoveryMinutes = recoveryMinutesMap?.[matchUp.matchUpId];

      updateTimeAfterRecovery({
        matchUpPotentialParticipantIds,
        individualParticipantProfiles,
        matchUpNotBeforeTimes,
        averageMatchUpMinutes,
        matchUpDependencies,
        recoveryMinutes: mappedRecoveryMinutes || recoveryMinutes,
        scheduleDate,
        scheduleTime,
        matchUp,
      });

      matchUpScheduleTimes[matchUp.matchUpId] = scheduleTime;
      return true;
    });

    matchUpsToSchedule = matchUpsToSchedule.filter(
      ({ matchUpId }) => matchUpId !== scheduledMatchUp?.matchUpId
    );

    if (!scheduledMatchUp) {
      skippedScheduleTimes.push(scheduleTime);
    }
  }

  // cleanup limits counters for matchUps which could not be scheduled due to recovery times
  matchUpsToSchedule.forEach((matchUp) => {
    modifyParticipantMatchUpsCount({
      individualParticipantProfiles,
      matchUpPotentialParticipantIds,
      scheduleDate,
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
              // must include scheduleDate being scheduled to generate proper ISO string
              const formatTime = scheduleTime.split(':').map(zeroPad).join(':');
              const scheduledTime = `${extractDate(
                scheduleDate
              )}T${formatTime}`;

              if (dryRun) {
                scheduledMatchUpIds.push(matchUpId);
              } else {
                const result = addMatchUpScheduledTime({
                  drawDefinition,
                  matchUpId,
                  scheduledTime,
                });
                if (result.success) scheduledMatchUpIds.push(matchUpId);

                if (venueId) {
                  assignMatchUpVenue({
                    tournamentRecord,
                    drawDefinition,
                    matchUpId,
                    venueId,
                  });
                }
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

  return {
    ...SUCCESS,
    requestConflicts: Object.values(requestConflicts),
    remainingScheduleTimes: scheduleTimes.map(
      ({ scheduleTime }) => scheduleTime
    ),
    individualParticipantProfiles,
    matchUpNotBeforeTimes,
    participantIdsAtLimit, // at the moment this is only those participants at limit BEFORE scheduling begins
    skippedScheduleTimes,
    overLimitMatchUpIds,
    scheduledMatchUpIds,
    noTimeMatchUpIds,
  };
}
