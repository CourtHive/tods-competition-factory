import { getContainedStructures } from '../../../../tournamentEngine/governors/tournamentGovernor/getContainedStructures';
import { assignMatchUpVenue } from '../../../../tournamentEngine/governors/scheduleGovernor/assignMatchUpVenue';
import { addTournamentTimeItem } from '../../../../tournamentEngine/governors/tournamentGovernor/addTimeItem';
import { addMatchUpScheduledTime } from '../../../../drawEngine/governors/matchUpGovernor/scheduleItems';
import { modifyParticipantMatchUpsCount } from '../scheduleMatchUps/modifyParticipantMatchUpsCount';
import { checkDependenciesScheduled } from '../scheduleMatchUps/checkDependenciesScheduled';
import { getScheduledRoundsDetails } from '../schedulingProfile/getScheduledRoundsDetails';
import { updateTimeAfterRecovery } from '../scheduleMatchUps/updateTimeAfterRecovery';
import { getDrawDefinition } from '../../../../tournamentEngine/getters/eventGetter';
import { getMatchUpDependencies } from '../scheduleMatchUps/getMatchUpDependencies';
import { checkRequestConflicts } from '../scheduleMatchUps/checkRequestConflicts';
import { getSchedulingProfile } from '../schedulingProfile/schedulingProfile';
import { processNextMatchUps } from '../scheduleMatchUps/processNextMatchUps';
import { getVenuesAndCourts } from '../../../getters/venuesAndCourtsGetter';
import { checkRecoveryTime } from '../scheduleMatchUps/checkRecoveryTime';
import { getGroupedRounds } from '../schedulingProfile/getGroupedRounds';
import { allCompetitionMatchUps } from '../../../getters/matchUpsGetter';
import { checkDailyLimits } from '../scheduleMatchUps/checkDailyLimits';
import { getPersonRequests } from '../scheduleMatchUps/personRequests';
import { addNotice, getTopics } from '../../../../global/globalState';
import { clearScheduledMatchUps } from '../clearScheduledMatchUps';
import { getMatchUpDailyLimits } from '../getMatchUpDailyLimits';
import { generateScheduleTimes } from './generateScheduleTimes';
import {
  extractDate,
  isValidDateString,
  sameDay,
  timeStringMinutes,
  zeroPad,
} from '../../../../utilities/dateTime';

import { DO_NOT_SCHEDULE } from '../../../../constants/requestConstants';
import { SUCCESS } from '../../../../constants/resultConstants';
import { TOTAL } from '../../../../constants/scheduleConstants';
import { AUDIT } from '../../../../constants/topicConstants';
import {
  INVALID_VALUES,
  MISSING_TOURNAMENT_RECORDS,
  NO_VALID_DATES,
} from '../../../../constants/errorConditionConstants';
import {
  BYE,
  ABANDONED,
  DEFAULTED,
  RETIRED,
  WALKOVER,
  COMPLETED,
} from '../../../../constants/matchUpStatusConstants';

export function jinnScheduler({
  checkPotentialRequestConflicts = true, // passed to checkRequestConflicts
  clearScheduleDates,
  scheduleDates = [],
  tournamentRecords,
  periodLength,
  dryRun,
}) {
  if (!tournamentRecords) return { error: MISSING_TOURNAMENT_RECORDS };
  if (!Array.isArray(scheduleDates)) return { error: INVALID_VALUES };

  const {
    schedulingProfile = [],
    issues: schedulingProfileIssues = [],
    modifications: schedulingProfileModifications,
  } = getSchedulingProfile({ tournamentRecords });

  const containedStructureIds = Object.assign(
    {},
    ...Object.values(tournamentRecords).map(getContainedStructures)
  );

  const validScheduleDates = scheduleDates
    .map((scheduleDate) => {
      if (!isValidDateString(scheduleDate)) return;
      return extractDate(scheduleDate);
    })
    .filter(Boolean);

  const profileDates = schedulingProfile
    .map((dateSchedulingProfile) => dateSchedulingProfile.scheduleDate)
    .map(
      (scheduleDate) =>
        isValidDateString(scheduleDate) && extractDate(scheduleDate)
    )
    .filter(
      (scheduleDate) =>
        scheduleDate &&
        (!scheduleDates.length || validScheduleDates.includes(scheduleDate))
    );

  if (!profileDates.length) {
    return { error: NO_VALID_DATES };
  }

  if (clearScheduleDates && !dryRun) {
    const scheduledDates = Array.isArray(clearScheduleDates)
      ? clearScheduleDates
      : undefined;
    clearScheduledMatchUps({ tournamentRecords, scheduledDates });
  }

  const { courts } = getVenuesAndCourts({ tournamentRecords });

  const { matchUps } = allCompetitionMatchUps({
    tournamentRecords,
    nextMatchUps: true,
  });

  const { matchUpDependencies } = getMatchUpDependencies({
    includeParticipantDependencies: true,
    tournamentRecords,
    matchUps,
  });

  const { matchUpDailyLimits } = getMatchUpDailyLimits({ tournamentRecords });

  const { personRequests } = getPersonRequests({
    tournamentRecords,
    requestType: DO_NOT_SCHEDULE,
  });

  const dateSchedulingProfiles = schedulingProfile
    .filter((dateschedulingProfile) => {
      const scheduleDate = extractDate(dateschedulingProfile?.scheduleDate);
      return profileDates.includes(scheduleDate);
    })
    .sort((a, b) => {
      new Date(a.scheduleDate).getTime() - new Date(b.scheduleDate).getTime();
    });

  const scheduleTimesRemaining = {};
  const skippedScheduleTimes = {};

  const recoveryTimeDeferredMatchUpIds = {};
  const dependencyDeferredMatchUpIds = {};
  const scheduleDateRequestConflicts = {};
  const scheduledMatchUpIds = {};
  const overLimitMatchUpIds = {};
  const noTimeMatchUpIds = {};
  const requestConflicts = {};
  const matchUpScheduleTimes = {};

  for (const dateSchedulingProfile of dateSchedulingProfiles) {
    const scheduleDate = extractDate(dateSchedulingProfile?.scheduleDate);
    const venues = dateSchedulingProfile?.venues || [];
    const matchUpPotentialParticipantIds = {};
    const venueScheduledRoundDetails = {};
    const individualParticipantProfiles = {};

    const bumpLimits = (relevantParticipantIds, matchUpType) => {
      relevantParticipantIds.forEach((participantId) => {
        const counters = individualParticipantProfiles[participantId].counters;
        if (counters[matchUpType]) counters[matchUpType] += 1;
        else counters[matchUpType] = 1;
        if (counters[TOTAL]) counters[TOTAL] += 1;
        else counters[TOTAL] = 1;
      });
    };

    recoveryTimeDeferredMatchUpIds[scheduleDate] = {};
    dependencyDeferredMatchUpIds[scheduleDate] = {};
    scheduleTimesRemaining[scheduleDate] = {};
    skippedScheduleTimes[scheduleDate] = {};
    scheduledMatchUpIds[scheduleDate] = []; // will not be in scheduled order
    overLimitMatchUpIds[scheduleDate] = [];
    noTimeMatchUpIds[scheduleDate] = [];
    requestConflicts[scheduleDate] = [];

    // Build up matchUpNotBeforeTimes for all matchUps already scheduled on scheduleDate
    const matchUpNotBeforeTimes = {};
    matchUps.forEach((matchUp) => {
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

    // checking that matchUpDependencies is scoped to only those matchUps that are to be scheduled on the same date
    const allDateMatchUpIds = [];

    // first pass through all venues is to build up an array of all matchUpIds in the schedulingProfile for current scheduleDate
    for (const venue of venues) {
      const { rounds = [], venueId } = venue;
      const {
        scheduledRoundsDetails,
        greatestAverageMinutes,
        orderedMatchUpIds,
        minutesMap,
      } = getScheduledRoundsDetails({
        tournamentRecords,
        containedStructureIds,
        periodLength,
        matchUps,
        rounds,
      });

      allDateMatchUpIds.push(...orderedMatchUpIds);

      const { groupedRounds } = getGroupedRounds({
        scheduledRoundsDetails,
        greatestAverageMinutes,
        garmanSinglePass: true,
      });

      // determines court availability taking into account already scheduled matchUps on the scheduleDate
      // optimization to pass already retrieved competitionMatchUps to avoid refetch (requires refactor)
      // on first call pass in the averageMatchUpMiutes of first round to be scheduled
      const { scheduleTimes, dateScheduledMatchUpIds } = generateScheduleTimes({
        averageMatchUpMinutes: groupedRounds[0]?.averageMinutes,
        scheduleDate: extractDate(scheduleDate),
        venueIds: [venue.venueId],
        clearScheduleDates,
        tournamentRecords,
        periodLength,
        matchUps,
      });

      // first build up a map of matchUpNotBeforeTimes and matchUpPotentialParticipantIds
      // based on already scheduled matchUps
      const clearDate = Array.isArray(clearScheduleDates)
        ? clearScheduleDates.includes(scheduleDate)
        : clearScheduleDates;
      const alreadyScheduled = clearDate
        ? []
        : matchUps.filter(({ matchUpId }) =>
            dateScheduledMatchUpIds.includes(matchUpId)
          );
      for (const matchUp of alreadyScheduled) {
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
          const recoveryMinutes =
            minutesMap?.[matchUp.matchUpId]?.recoveryMinutes;
          const averageMatchUpMinutes = greatestAverageMinutes;
          // minutesMap?.[matchUp.matchUpId]?.averageMinutes; // for the future when variable averageMinutes supported

          updateTimeAfterRecovery({
            individualParticipantProfiles,
            matchUpPotentialParticipantIds,
            matchUpNotBeforeTimes,
            matchUpDependencies,

            recoveryMinutes,
            averageMatchUpMinutes,
            scheduleDate,
            scheduleTime,
            matchUp,
          });
        }
      }

      // this must be done to preserve the order of matchUpIds
      let matchUpsToSchedule = orderedMatchUpIds
        .map((matchUpId) =>
          matchUps.find((matchUp) => matchUp.matchUpId === matchUpId)
        )
        .filter(Boolean)
        .filter((matchUp) => {
          const alreadyScheduled =
            !clearDate && dateScheduledMatchUpIds.includes(matchUp.matchUpId);

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
      const { matchUpMap } = matchUpsToSchedule.reduce(
        (aggregator, matchUp) => {
          const { drawId, tournamentId /*, matchUpType*/ } = matchUp;

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
        { matchUpMap: {} }
      );

      venueScheduledRoundDetails[venueId] = {
        courtsCount: courts.filter((court) => court.venueId === venueId).length,
        previousRemainingScheduleTimes: [], // keep track of sheduleTimes not used on previous iteration
        greatestAverageMinutes,
        scheduledRoundsDetails,
        matchUpsToSchedule,
        scheduleTimes,
        groupedRounds,
        minutesMap,
        matchUpMap,
      };
    }

    const failSafe = 10;
    let schedulingComplete;
    let schedulingIterations = 0;
    let maxScheduleTimeAttempts = 10; // TODO: calculate this based on max court start/end range and averageMinutes

    while (!schedulingComplete) {
      // for each venue schedule a round
      for (const { venueId } of venues) {
        let scheduledThisPass = 0;
        const details = venueScheduledRoundDetails[venueId];

        while (
          details.courtsCount &&
          details.scheduleTimes?.length &&
          details.matchUpsToSchedule?.length &&
          scheduledThisPass <= details.courtsCount
        ) {
          // attempt to schedule a round or at least venue.courts.length matchUps
          const { scheduleTime, attempts = 0 } = details.scheduleTimes.shift();
          const scheduledMatchUp = details.matchUpsToSchedule.find(
            (matchUp) => {
              const { matchUpId, matchUpType } = matchUp;

              const { participantIdsAtLimit, relevantParticipantIds } =
                checkDailyLimits({
                  matchUpPotentialParticipantIds,
                  individualParticipantProfiles,
                  matchUpDailyLimits,
                  matchUp,
                });

              if (participantIdsAtLimit.length) {
                if (!overLimitMatchUpIds[scheduleDate].includes(matchUpId))
                  overLimitMatchUpIds[scheduleDate].push(matchUpId);
                return false;
              }

              const { dependenciesScheduled, remainingDependencies } =
                checkDependenciesScheduled({
                  matchUpScheduleTimes,
                  matchUpDependencies,
                  allDateMatchUpIds,
                  matchUps,
                  matchUp,
                });
              if (!dependenciesScheduled) {
                if (!dependencyDeferredMatchUpIds[scheduleDate][matchUpId])
                  dependencyDeferredMatchUpIds[scheduleDate][matchUpId] = [];
                dependencyDeferredMatchUpIds[scheduleDate][matchUpId].push({
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
                if (!recoveryTimeDeferredMatchUpIds[scheduleDate][matchUpId])
                  recoveryTimeDeferredMatchUpIds[scheduleDate][matchUpId] = [];
                recoveryTimeDeferredMatchUpIds[scheduleDate][matchUpId].push({
                  scheduleTime,
                });
                return false;
              }

              const recoveryMinutes =
                details.minutesMap?.[matchUpId]?.recoveryMinutes;
              const averageMatchUpMinutes = details.greatestAverageMinutes;
              // details.minutesMap?.[matchUpId]?.averageMinutes;
              // TODO: check the previous scheduled matchUp for each participantId/potentialParticipantId
              // CHECK: if the matchUpType has changed for ALL PARTICIPANTS from SINGLE/DOUBLES use typeChangeRecoveryMinutes

              const { conflicts } = checkRequestConflicts({
                potentials: checkPotentialRequestConflicts,
                averageMatchUpMinutes,
                requestConflicts,
                personRequests,
                scheduleTime,
                scheduleDate,
                matchUp,
              });

              if (conflicts?.length) {
                if (!scheduleDateRequestConflicts[scheduleDate])
                  scheduleDateRequestConflicts[scheduleDate] = [];
                scheduleDateRequestConflicts[scheduleDate].push(...conflicts);
                return false;
              }

              bumpLimits(relevantParticipantIds, matchUpType);

              updateTimeAfterRecovery({
                matchUpPotentialParticipantIds,
                individualParticipantProfiles,
                matchUpNotBeforeTimes,
                averageMatchUpMinutes,
                matchUpDependencies,
                recoveryMinutes,
                scheduleDate,
                scheduleTime,
                matchUp,
              });

              matchUpScheduleTimes[matchUpId] = scheduleTime;

              return true;
            }
          );

          details.matchUpsToSchedule = details.matchUpsToSchedule.filter(
            ({ matchUpId }) => matchUpId !== scheduledMatchUp?.matchUpId
          );

          if (!scheduledMatchUp) {
            if (!skippedScheduleTimes[scheduleDate][venueId])
              skippedScheduleTimes[scheduleDate][venueId] = [];
            skippedScheduleTimes[scheduleDate][venueId].push({
              scheduleTime,
              attempts: attempts + 1,
            });
          } else {
            scheduledThisPass += 1;
          }
        }

        if (details.matchUpsToSchedule?.length) {
          skippedScheduleTimes[scheduleDate][venueId] = skippedScheduleTimes[
            scheduleDate
          ][venueId]?.filter((unused) => {
            const tryAgain = unused.attempts < maxScheduleTimeAttempts;
            if (tryAgain) details.scheduleTimes.push(unused);
            return !tryAgain;
          });
        }

        if (
          !details.scheduleTimes?.length ||
          !details.matchUpsToSchedule?.length
        )
          details.complete = true;
      }

      schedulingIterations += 1;
      schedulingComplete =
        venues.every(
          ({ venueId }) => venueScheduledRoundDetails[venueId].complete
        ) || schedulingIterations === failSafe;
    }

    // assign scheduledTime and venue to each matchUp
    // because this is done in an optimized fashion from hash of assignments
    // scheduledMatchUpIds[scheduleDate] will not be in the order that scheduleTimes were assigned
    for (const { venueId } of venues) {
      const matchUpMap = venueScheduledRoundDetails[venueId].matchUpMap;

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
                  const formatTime = scheduleTime
                    .split(':')
                    .map(zeroPad)
                    .join(':');
                  const scheduledTime = `${extractDate(
                    scheduleDate
                  )}T${formatTime}`;

                  if (dryRun) {
                    scheduledMatchUpIds[scheduleDate].push(matchUpId);
                  } else {
                    const result = addMatchUpScheduledTime({
                      drawDefinition,
                      matchUpId,
                      scheduledTime,
                    });
                    if (result.success)
                      scheduledMatchUpIds[scheduleDate].push(matchUpId);

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
        }
      });

      noTimeMatchUpIds[scheduleDate] = venueScheduledRoundDetails[
        venueId
      ].matchUpsToSchedule.map(({ matchUpId }) => matchUpId);

      scheduleTimesRemaining[scheduleDate][venueId] =
        venueScheduledRoundDetails[venueId].scheduleTimes.sort(
          (a, b) =>
            timeStringMinutes(a.scheduleTime) -
            timeStringMinutes(b.scheduleTime)
        );
    }
  }

  // returns the original form of the dateStrings, before extractDate()
  const scheduledDates = dateSchedulingProfiles.map(
    ({ scheduleDate }) => scheduleDate
  );

  const autoSchedulingAudit = {
    timeStamp: Date.now(),
    schedulingProfile,
    scheduledDates,
    noTimeMatchUpIds,
    scheduledMatchUpIds,
    overLimitMatchUpIds,
    requestConflicts,
  };
  const { topics } = getTopics();
  if (topics.includes(AUDIT)) {
    addNotice({ topic: AUDIT, payload: autoSchedulingAudit });
  } else {
    const timeItem = {
      itemType: 'autoSchedulingAudit',
      itemValue: autoSchedulingAudit,
    };
    for (const tournamentRecord of Object.values(tournamentRecords)) {
      addTournamentTimeItem({ tournamentRecord, timeItem });
    }
  }

  return {
    ...SUCCESS,
    schedulingProfileModifications,
    schedulingProfileIssues,
    scheduleTimesRemaining,
    skippedScheduleTimes,

    recoveryTimeDeferredMatchUpIds,
    dependencyDeferredMatchUpIds,
    matchUpScheduleTimes,
    scheduledMatchUpIds,
    overLimitMatchUpIds,
    noTimeMatchUpIds,
    requestConflicts,
    scheduledDates,
    jinn: true,
  };
}
