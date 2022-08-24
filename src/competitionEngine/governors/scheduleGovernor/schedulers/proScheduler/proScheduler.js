import { assignMatchUpVenue } from '../../../../../tournamentEngine/governors/scheduleGovernor/assignMatchUpVenue';
import { addTournamentTimeItem } from '../../../../../tournamentEngine/governors/tournamentGovernor/addTimeItem';
import { addMatchUpScheduledTime } from '../../../../../drawEngine/governors/matchUpGovernor/scheduleItems';
import { checkDependenciesScheduled } from '../../scheduleMatchUps/checkDependenciesScheduled';
import { updateTimeAfterRecovery } from '../../scheduleMatchUps/updateTimeAfterRecovery';
import { getDrawDefinition } from '../../../../../tournamentEngine/getters/eventGetter';
import { checkDependendantTiming } from '../../scheduleMatchUps/checkDependentTiming';
import { checkRequestConflicts } from '../../scheduleMatchUps/checkRequestConflicts';
import { processNextMatchUps } from '../../scheduleMatchUps/processNextMatchUps';
import { getVenueSchedulingDetails } from '../utils/getVenueSchedulingDetails';
import { addNotice, getTopics } from '../../../../../global/state/globalState';
import { checkRecoveryTime } from '../../scheduleMatchUps/checkRecoveryTime';
import { checkDailyLimits } from '../../scheduleMatchUps/checkDailyLimits';
import { getMatchUpId } from '../../../../../global/functions/extractors';
import { generateVirtualCourts } from '../utils/generateVirtualCourts';
import { getEarliestCourtTime } from '../utils/getEarliestCourtTime';
import { generateBookings } from '../utils/generateBookings';
import {
  extractDate,
  sameDay,
  timeStringMinutes,
  zeroPad,
} from '../../../../../utilities/dateTime';

import { SUCCESS } from '../../../../../constants/resultConstants';
import { TOTAL } from '../../../../../constants/scheduleConstants';
import { AUDIT } from '../../../../../constants/topicConstants';

export function proScheduler({
  schedulingProfileModifications,
  checkPotentialRequestConflicts,
  scheduleCompletedMatchUps, // override which can be used by mocksEngine
  schedulingProfileIssues,
  dateSchedulingProfiles,
  containedStructureIds,
  matchUpDependencies,
  matchUpDailyLimits,
  clearScheduleDates,
  schedulingProfile,
  tournamentRecords,
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

    const { venueScheduledRoundDetails, allDateMatchUpIds } =
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
        periodLength,
        scheduleDate,
        matchUps,
        courts,
        venues,
      });

    const failSafe = 10;
    let schedulingComplete;
    let schedulingIterations = 0;
    let maxScheduleTimeAttempts = 10; // TODO: calculate this based on max court start/end range and averageMinutes

    while (!schedulingComplete) {
      // for each venue schedule a round
      for (const { venueId } of venues) {
        let scheduledThisPass = 0;
        const details = venueScheduledRoundDetails[venueId];
        console.log(details.matchUpsToSchedule.length);

        const { bookings } = generateBookings({
          dateScheduledMatchUps: details.dateScheduledMatchUps,
          tournamentRecords,
          scheduleDate,
          periodLength,
        });
        const { virtualCourts } = generateVirtualCourts({
          courts: details.venueCourts,
          clearScheduleDates,
          scheduleDate,
          periodLength,
          bookings,
        });

        virtualCourts.forEach((court) => {
          const { earliestCourtTime } = getEarliestCourtTime({
            averageMinutes: details.greatestAverageMinutes,
            date: scheduleDate,
            court,
          });
          console.log({ earliestCourtTime });
        });

        // on each pass attempt to schedule one matchUp per court
        // when a matchUp is scheduled, add it to details.dateScheduledMatchUps

        while (
          details.courtsCount &&
          details.matchUpsToSchedule?.length &&
          scheduledThisPass <= details.courtsCount
        ) {
          // attempt to schedule a round or at least venue.courts.length matchUps
          const scheduledMatchUp = details.matchUpsToSchedule.find(
            (matchUp) => {
              const { matchUpId, matchUpType } = matchUp;
              let scheduleTime;

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

              const { scheduledDependent } = checkDependendantTiming({
                matchUpScheduleTimes,
                matchUpDependencies,
                scheduleTime,
                matchUpId,
                details,
              });
              if (scheduledDependent) return false;

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

              const recoveryMinutes =
                details.minutesMap?.[matchUpId]?.recoveryMinutes;

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
            //
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
                      scheduledTime,
                      matchUpId,
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

      noTimeMatchUpIds[scheduleDate] =
        venueScheduledRoundDetails[venueId].matchUpsToSchedule.map(
          getMatchUpId
        );

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
    dateSchedulingProfiles,
    skippedScheduleTimes,

    recoveryTimeDeferredMatchUpIds,
    dependencyDeferredMatchUpIds,
    matchUpScheduleTimes,
    scheduledMatchUpIds,
    overLimitMatchUpIds,
    noTimeMatchUpIds,
    requestConflicts,
    scheduledDates,
  };
}
