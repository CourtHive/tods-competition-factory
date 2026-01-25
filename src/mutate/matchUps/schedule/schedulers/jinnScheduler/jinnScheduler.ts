import { checkDependenciesScheduled } from '@Mutate/matchUps/schedule/scheduleMatchUps/checkDependenciesScheduled';
import { updateTimeAfterRecovery } from '@Mutate/matchUps/schedule/scheduleMatchUps/updateTimeAfterRecovery';
import { checkDependendantTiming } from '@Mutate/matchUps/schedule/scheduleMatchUps/checkDependentTiming';
import { checkRequestConflicts } from '@Mutate/matchUps/schedule/scheduleMatchUps/checkRequestConflicts';
import { processNextMatchUps } from '@Mutate/matchUps/schedule/scheduleMatchUps/processNextMatchUps';
import { getVenueSchedulingDetails } from '@Query/matchUps/scheduling/getVenueSchedulingDetails';
import { checkRecoveryTime } from '@Mutate/matchUps/schedule/scheduleMatchUps/checkRecoveryTime';
import { auditAutoScheduling } from '@Mutate/matchUps/schedule/schedulers/auditAutoScheduling';
import { checkDailyLimits } from '@Mutate/matchUps/schedule/scheduleMatchUps/checkDailyLimits';
import { bulkScheduleMatchUps } from '@Mutate/matchUps/schedule/bulkScheduleMatchUps';
import { extractDate, sameDay, timeStringMinutes, zeroPad } from '@Tools/dateTime';
import { addMatchUpScheduledTime } from '@Mutate/matchUps/schedule/scheduledTime';
import { assignMatchUpVenue } from '@Mutate/matchUps/schedule/assignMatchUpVenue';
import { findDrawDefinition } from '@Acquire/findDrawDefinition';
import { getMatchUpId } from '@Functions/global/extractors';

// Constants
import { SUCCESS } from '@Constants/resultConstants';
import { TOTAL } from '@Constants/scheduleConstants';

export function jinnScheduler({
  schedulingProfileModifications,
  checkPotentialRequestConflicts,
  scheduleCompletedMatchUps, // override which can be used by mocksEngine
  schedulingProfileIssues,
  dateSchedulingProfiles,
  containedStructureIds,
  matchUpDependencies,
  matchUpDailyLimits,
  clearScheduleDates,
  tournamentRecords,
  schedulingProfile,
  personRequests,
  periodLength,
  matchUps,
  courts,
  dryRun,
}) {
  const scheduleTimesRemaining = {};
  const skippedScheduleTimes = {};

  const recoveryTimeDeferredMatchUpIds = {};
  const dependencyDeferredMatchUpIds = {};
  const scheduleDateRequestConflicts = {};
  const matchUpScheduleTimes = {};
  const scheduledMatchUpIds = {};
  const overLimitMatchUpIds = {};
  const noTimeMatchUpIds = {};
  const requestConflicts = {};

  for (const dateSchedulingProfile of dateSchedulingProfiles) {
    const scheduleDate = extractDate(dateSchedulingProfile?.scheduleDate);
    const venues = dateSchedulingProfile?.venues || [];
    const matchUpPotentialParticipantIds = {};
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
      if (matchUp.schedule?.scheduledDate && sameDay(scheduleDate, extractDate(matchUp.schedule.scheduledDate))) {
        processNextMatchUps({
          matchUpPotentialParticipantIds,
          matchUpNotBeforeTimes,
          matchUp,
        });
      }
    });

    const { allDateScheduledByeMatchUpDetails, venueScheduledRoundDetails, allDateMatchUpIds } =
      getVenueSchedulingDetails({
        matchUpPotentialParticipantIds,
        individualParticipantProfiles,
        scheduleCompletedMatchUps,
        containedStructureIds,
        matchUpNotBeforeTimes,
        matchUpScheduleTimes,
        matchUpDependencies,
        clearScheduleDates,
        tournamentRecords,
        useGarman: true,
        periodLength,
        scheduleDate,
        matchUps,
        courts,
        venues,
      });

    const maxScheduleTimeAttempts = 10;
    let schedulingIterations = 0;
    let schedulingComplete;
    const failSafe = 10;

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
          const scheduledMatchUp = details.matchUpsToSchedule.find((matchUp) => {
            const { matchUpId, matchUpType } = matchUp;

            const { participantIdsAtLimit, relevantParticipantIds } = checkDailyLimits({
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

            const { scheduledDependent } = checkDependendantTiming({
              matchUpScheduleTimes,
              matchUpDependencies,
              scheduleTime,
              matchUpId,
              details,
            });
            if (scheduledDependent) return false;

            const { dependenciesScheduled, remainingDependencies } = checkDependenciesScheduled({
              matchUpScheduleTimes,
              matchUpDependencies,
              allDateMatchUpIds,
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
              details,
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

            const averageMatchUpMinutes = details.greatestAverageMinutes;
            // details.minutesMap?.[matchUpId]?.averageMinutes;
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
              if (!scheduleDateRequestConflicts[scheduleDate]) scheduleDateRequestConflicts[scheduleDate] = [];
              scheduleDateRequestConflicts[scheduleDate].push(...conflicts);
              return false;
            }

            bumpLimits(relevantParticipantIds, matchUpType);

            const recoveryMinutes = details.minutesMap?.[matchUpId]?.recoveryMinutes;

            updateTimeAfterRecovery({
              matchUpPotentialParticipantIds,
              individualParticipantProfiles,
              matchUpNotBeforeTimes,
              averageMatchUpMinutes,
              matchUpDependencies,
              recoveryMinutes,
              scheduleTime,
              matchUp,
            });

            matchUpScheduleTimes[matchUpId] = scheduleTime;

            return true;
          });

          details.matchUpsToSchedule = details.matchUpsToSchedule.filter(
            ({ matchUpId }) => matchUpId !== scheduledMatchUp?.matchUpId,
          );

          if (!scheduledMatchUp) {
            if (!skippedScheduleTimes[scheduleDate][venueId]) skippedScheduleTimes[scheduleDate][venueId] = [];
            skippedScheduleTimes[scheduleDate][venueId].push({
              scheduleTime,
              attempts: attempts + 1,
            });
          } else {
            scheduledThisPass += 1;
          }
        }

        if (details.matchUpsToSchedule?.length) {
          skippedScheduleTimes[scheduleDate][venueId] = skippedScheduleTimes[scheduleDate][venueId]?.filter(
            (unused) => {
              const tryAgain = unused.attempts < maxScheduleTimeAttempts;
              if (tryAgain) details.scheduleTimes.push(unused);
              return !tryAgain;
            },
          );
        }

        if (!details.scheduleTimes?.length || !details.matchUpsToSchedule?.length) details.complete = true;
      }

      schedulingIterations += 1;
      schedulingComplete =
        venues.every(({ venueId }) => venueScheduledRoundDetails[venueId].complete) ||
        schedulingIterations === failSafe;
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
                  const scheduledTime = `${extractDate(scheduleDate)}T${formatTime}`;

                  if (dryRun) {
                    scheduledMatchUpIds[scheduleDate].push(matchUpId);
                  } else {
                    const result = addMatchUpScheduledTime({
                      drawDefinition,
                      scheduledTime,
                      matchUpId,
                    });
                    if (result.success) scheduledMatchUpIds[scheduleDate].push(matchUpId);

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

      noTimeMatchUpIds[scheduleDate] = venueScheduledRoundDetails[venueId].matchUpsToSchedule.map(getMatchUpId);

      scheduleTimesRemaining[scheduleDate][venueId] = venueScheduledRoundDetails[venueId].scheduleTimes.sort(
        (a, b) => timeStringMinutes(a.scheduleTime) - timeStringMinutes(b.scheduleTime),
      );
    }

    if (!dryRun && allDateScheduledByeMatchUpDetails?.length) {
      // remove scheduling information for BYE matchUps from any rounds that were scheduled
      // remove scheduling information for BYE matchUps from any rounds that were scheduled
      bulkScheduleMatchUps({
        matchUpDetails: allDateScheduledByeMatchUpDetails,
        scheduleByeMatchUps: true,
        removePriorValues: true,
        tournamentRecords,
        schedule: {
          scheduledDate: '',
          scheduledTime: '',
          courtOrder: '',
          courtId: '',
          venueId: '',
        },
      });
    }

    for (const venue of dateSchedulingProfile.venues) {
      for (const round of venue.rounds) {
        const matchUpIds = round.matchUps?.map(({ matchUpId }) => matchUpId) || [];
        const canScheduleMatchUpIds = matchUpIds.filter((matchUpId) =>
          scheduledMatchUpIds[scheduleDate].includes(matchUpId),
        );
        round.canScheduledMatchUpIds = canScheduleMatchUpIds;
        let possibleToSchedulePct = Math.round((canScheduleMatchUpIds.length / round.matchUpsCount) * 10000) / 100;
        if (possibleToSchedulePct === Infinity || isNaN(possibleToSchedulePct)) possibleToSchedulePct = 0;
        round.possibleToSchedulePct = possibleToSchedulePct;
        if (round.matchUpsCount === canScheduleMatchUpIds.length) {
          round.possibleToSchedule = true;
        }
      }
    }
  }

  // returns the original form of the dateStrings, before extractDate()
  const scheduledDates = dateSchedulingProfiles.map(({ scheduleDate }) => scheduleDate);

  const autoSchedulingAudit = {
    timeStamp: Date.now(),
    overLimitMatchUpIds,
    scheduledMatchUpIds,
    schedulingProfile,
    noTimeMatchUpIds,
    requestConflicts,
    scheduledDates,
  };

  auditAutoScheduling({ tournamentRecords, autoSchedulingAudit });

  return {
    ...SUCCESS,
    schedulingProfileModifications,
    schedulingProfileIssues,
    scheduleTimesRemaining,
    dateSchedulingProfiles,
    skippedScheduleTimes,

    recoveryTimeDeferredMatchUpIds,
    dependencyDeferredMatchUpIds,
    matchUpScheduleTimes,
    overLimitMatchUpIds,
    scheduledMatchUpIds,
    noTimeMatchUpIds,
    requestConflicts,
    scheduledDates,
  };
}
