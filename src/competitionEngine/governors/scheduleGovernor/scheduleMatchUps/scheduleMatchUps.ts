import { addMatchUpScheduledTime } from '../../../../mutate/matchUps/schedule/scheduledTime';
import { assignMatchUpVenue } from '../../../../mutate/matchUps/schedule/assignMatchUpVenue';
import { checkParticipantProfileInitialization } from './checkParticipantProfileInitialization';
import { findDrawDefinition } from '../../../../acquire/findDrawDefinition';
import { modifyParticipantMatchUpsCount } from './modifyParticipantMatchUpsCount';
import { checkDependenciesScheduled } from './checkDependenciesScheduled';
import { allCompetitionMatchUps } from '../../../../query/matchUps/getAllCompetitionMatchUps';
import { getMatchUpIds } from '../../../../global/functions/extractors';
import { updateTimeAfterRecovery } from './updateTimeAfterRecovery';
import { calculateScheduleTimes } from './calculateScheduleTimes';
import { getMatchUpDependencies } from '../../../../query/matchUps/getMatchUpDependencies';
import { checkRequestConflicts } from './checkRequestConflicts';
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
import { TOTAL } from '../../../../constants/scheduleConstants';
import {
  MISSING_TOURNAMENT_RECORDS,
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
  clearScheduleDates,

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
      includeParticipantDependencies: true,
      matchUps: competitionMatchUps,
      tournamentRecords,
    }));
  }

  competitionMatchUps.forEach((matchUp) => {
    if (
      matchUp.schedule?.scheduledDate &&
      sameDay(scheduleDate, extractDate(matchUp.schedule.scheduledDate))
    ) {
      processNextMatchUps({
        matchUpPotentialParticipantIds,
        matchUpNotBeforeTimes,
        matchUp,
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
      clearScheduleDates,
      periodLength,
      venueIds,
    });
  const requestConflicts = {};
  const skippedScheduleTimes: string[] = [];
  const matchUpScheduleTimes = {};
  const recoveryTimeDeferred = {};
  const dependencyDeferred = {};

  // first build up a map of matchUpNotBeforeTimes and matchUpPotentialParticipantIds
  // based on already scheduled matchUps
  const dateScheduledMatchUps = competitionMatchUps.filter(
    ({ matchUpId }) => dateScheduledMatchUpIds?.includes(matchUpId)
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
      matchUpScheduleTimes[matchUp.matchUpId] = scheduleTime;
      const mappedRecoveryMinutes = recoveryMinutesMap?.[matchUp.matchUpId];
      updateTimeAfterRecovery({
        recoveryMinutes: mappedRecoveryMinutes || recoveryMinutes,
        matchUpPotentialParticipantIds,
        individualParticipantProfiles,
        matchUpNotBeforeTimes,
        averageMatchUpMinutes,
        matchUpDependencies,
        scheduleTime,
        matchUp,
      });
    }
  });

  // matchUps are assumed to be in the desired order for scheduling
  let matchUpsToSchedule = targetMatchUps.filter((matchUp) => {
    const alreadyScheduled = dateScheduledMatchUpIds?.includes(
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
        const { drawId, tournamentId, matchUpType } = matchUp;

        const { participantIdsAtLimit, relevantParticipantIds } =
          checkDailyLimits({
            individualParticipantProfiles,
            matchUpPotentialParticipantIds,
            matchUpDailyLimits,
            matchUp,
          });

        if (participantIdsAtLimit?.length) {
          aggregator.overLimitMatchUpIds.push(matchUp.matchUpId);
          aggregator.participantIdsAtLimit.push(...participantIdsAtLimit);
          return aggregator;
        }

        relevantParticipantIds.forEach((participantId) => {
          checkParticipantProfileInitialization({
            individualParticipantProfiles,
            participantId,
          });
          const counters =
            individualParticipantProfiles[participantId].counters;
          if (counters[matchUpType]) counters[matchUpType] += 1;
          else counters[matchUpType] = 1;
          if (counters[TOTAL]) counters[TOTAL] += 1;
          else counters[TOTAL] = 1;
        });

        if (!aggregator.matchUpMap[tournamentId])
          aggregator.matchUpMap[tournamentId] = {};
        if (!aggregator.matchUpMap[tournamentId][drawId]) {
          aggregator.matchUpMap[tournamentId][drawId] = [matchUp];
        } else {
          aggregator.matchUpMap[tournamentId][drawId].push(matchUp);
        }

        // since this matchUp is to be scheduled, update the matchUpPotentialParticipantIds
        processNextMatchUps({
          matchUpPotentialParticipantIds,
          matchUpNotBeforeTimes,
          matchUp,
        });

        return aggregator;
      },
      { matchUpMap: {}, overLimitMatchUpIds: [], participantIdsAtLimit: [] }
    );

  matchUpsToSchedule = matchUpsToSchedule.filter(
    ({ matchUpId }) => !overLimitMatchUpIds.includes(matchUpId)
  );

  let iterations = 0;
  const failSafe = scheduleTimes?.length ?? 0;

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
      const { matchUpId } = matchUp;
      const { dependenciesScheduled, remainingDependencies } =
        checkDependenciesScheduled({
          matchUpScheduleTimes,
          matchUpDependencies,
          allDateMatchUpIds,
          matchUp,
        });
      if (!dependenciesScheduled) {
        if (!dependencyDeferred[matchUpId]) dependencyDeferred[matchUpId] = [];
        dependencyDeferred[matchUpId].push({
          scheduleTime,
          remainingDependencies,
        });
        return false;
      }

      const { enoughTime } = checkRecoveryTime({
        individualParticipantProfiles,
        matchUpNotBeforeTimes,
        matchUpDependencies,
        scheduleTime,
        matchUp,
      });
      if (!enoughTime) {
        if (!recoveryTimeDeferred[matchUpId])
          recoveryTimeDeferred[matchUpId] = [];
        recoveryTimeDeferred[matchUpId].push({
          scheduleTime,
        });
        return false;
      }

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
        recoveryMinutes: mappedRecoveryMinutes || recoveryMinutes,
        matchUpPotentialParticipantIds,
        individualParticipantProfiles,
        matchUpNotBeforeTimes,
        averageMatchUpMinutes,
        matchUpDependencies,
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
      value: -1,
      matchUp,
    });
  });

  const scheduledMatchUpIds: string[] = [];
  Object.keys(matchUpMap).forEach((tournamentId) => {
    const tournamentRecord = tournamentRecords[tournamentId];
    if (tournamentRecord) {
      Object.keys(matchUpMap[tournamentId]).forEach((drawId) => {
        const { drawDefinition } = findDrawDefinition({
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
                    tournamentRecords,
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
    }
  });

  const noTimeMatchUpIds = getMatchUpIds(matchUpsToSchedule);

  return {
    ...SUCCESS,
    requestConflicts: Object.values(requestConflicts),
    remainingScheduleTimes: scheduleTimes?.map(
      ({ scheduleTime }) => scheduleTime
    ),
    individualParticipantProfiles,
    matchUpNotBeforeTimes,
    participantIdsAtLimit, // at the moment this is only those participants at limit BEFORE scheduling begins
    skippedScheduleTimes,
    overLimitMatchUpIds,
    scheduledMatchUpIds,
    noTimeMatchUpIds,

    recoveryTimeDeferred,
    dependencyDeferred,
  };
}
