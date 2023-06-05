import { assignMatchUpCourt } from '../../../../../tournamentEngine/governors/scheduleGovernor/assignMatchUpCourt';
import { addMatchUpScheduledTime } from '../../../../../drawEngine/governors/matchUpGovernor/scheduleItems';
import { checkDependenciesScheduled } from '../../scheduleMatchUps/checkDependenciesScheduled';
import { updateTimeAfterRecovery } from '../../scheduleMatchUps/updateTimeAfterRecovery';
import { getDrawDefinition } from '../../../../../tournamentEngine/getters/eventGetter';
import { checkDependendantTiming } from '../../scheduleMatchUps/checkDependentTiming';
import { checkRequestConflicts } from '../../scheduleMatchUps/checkRequestConflicts';
import { processNextMatchUps } from '../../scheduleMatchUps/processNextMatchUps';
import { getVenueSchedulingDetails } from '../utils/getVenueSchedulingDetails';
import { checkRecoveryTime } from '../../scheduleMatchUps/checkRecoveryTime';
import { checkDailyLimits } from '../../scheduleMatchUps/checkDailyLimits';
import { getMatchUpId } from '../../../../../global/functions/extractors';
import { generateVirtualCourts } from '../utils/generateVirtualCourts';
import { getEarliestCourtTime } from '../utils/getEarliestCourtTime';
import { auditAutoScheduling } from '../auditAutoSccheduling';
import { generateBookings } from '../utils/generateBookings';
import {
  addMinutesToTimeString,
  extractDate,
  sameDay,
  timeStringMinutes,
  timeToDate,
  zeroPad,
} from '../../../../../utilities/dateTime';

import { SUCCESS } from '../../../../../constants/resultConstants';
import { TOTAL } from '../../../../../constants/scheduleConstants';

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
  periodLength = 30,
  personRequests,
  matchUps,
  courts,
  dryRun,
}) {
  const recoveryTimeDeferredMatchUpIds = {};
  const dependencyDeferredMatchUpIds = {};
  const scheduleDateRequestConflicts = {};
  const matchUpScheduleCourtIds = {};
  const matchUpScheduleTimes = {};
  const scheduledMatchUpIds = {};
  const overLimitMatchUpIds = {};
  const noTimeMatchUpIds = {};
  const requestConflicts = {};

  // Start SCHEDULING
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

    const {
      allDateScheduledMatchUpIds,
      venueScheduledRoundDetails,
      allDateMatchUpIds,
    } = getVenueSchedulingDetails({
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
    const dateScheduledMatchUps = matchUps.filter(({ matchUpId }) =>
      allDateScheduledMatchUpIds.includes(matchUpId)
    );

    const { bookings } = generateBookings({
      dateScheduledMatchUps,
      tournamentRecords,
      scheduleDate,
      periodLength,
    });

    const { virtualCourts: dateCourts } = generateVirtualCourts({
      scheduleDate,
      periodLength,
      bookings,
      courts,
    });

    const venueTimeBoundaries = dateCourts.reduce((timeBoundaries, court) => {
      const { earliestCourtTime, courtEndTime } = getEarliestCourtTime({
        date: scheduleDate,
        averageMinutes: 0,
        court,
      });

      if (
        !timeBoundaries.startTime ||
        timeToDate(earliestCourtTime) < timeToDate(timeBoundaries.startTime)
      ) {
        timeBoundaries.startTime = earliestCourtTime;
      }

      if (
        !timeBoundaries.endTime ||
        timeToDate(courtEndTime) > timeToDate(timeBoundaries.endTime)
      ) {
        timeBoundaries.endTime = courtEndTime;
      }

      return timeBoundaries;
    }, {});

    let venueEarliestCourtTime = venueTimeBoundaries.startTime;

    const addDateCourtBooking = ({ courtId, booking }) =>
      dateCourts
        .find((court) => court.courtId === courtId)
        ?.dateAvailability[0].bookings.push(booking);

    // const failSafe = (allDateMatchUpIds.length / courts.length) * 2;
    const failSafe = 10;
    let schedulingIterations = 0;
    let schedulingComplete;

    while (!schedulingComplete) {
      // for each venue schedule a round
      for (const { venueId } of venues) {
        const details = venueScheduledRoundDetails[venueId];

        // on each pass attempt to schedule one matchUp per court
        // when a matchUp is scheduled, add it to details.dateScheduledMatchUps

        const venuePassFailSafe = details.matchUpsToSchedule.length;
        const matchUpIdsScheduled = [];
        const courtIdsScheduled = [];
        let venuePassComplete;
        let passIterations = 0;

        while (!venuePassComplete) {
          for (const matchUp of details.matchUpsToSchedule) {
            if (
              courtIdsScheduled.length === details.courtsCount ||
              matchUpIdsScheduled.length === details.courtsCount
            ) {
              venuePassComplete = true;
              break;
            }

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
              continue;
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
                remainingDependencies,
              });
              continue;
            }

            const schedulingConflicts = [];
            const courtTime = dateCourts.reduce((courtTime, court) => {
              if (courtIdsScheduled.includes(court.courtId)) return courtTime;

              const { earliestCourtTime: scheduleTime } = getEarliestCourtTime({
                averageMinutes: details.greatestAverageMinutes,
                startTime: venueEarliestCourtTime,
                date: scheduleDate,
                court,
              });

              if (
                courtTime.scheduleTime &&
                timeStringMinutes(scheduleTime) >=
                  timeStringMinutes(courtTime.scheduleTime)
              ) {
                return courtTime;
              }

              const { scheduledDependent } = checkDependendantTiming({
                matchUpScheduleTimes,
                matchUpDependencies,
                scheduleTime,
                matchUpId,
                details,
              });
              if (scheduledDependent) return courtTime;

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
                if (
                  !recoveryTimeDeferredMatchUpIds[scheduleDate][
                    matchUpId
                  ].includes(scheduleTime)
                ) {
                  recoveryTimeDeferredMatchUpIds[scheduleDate][matchUpId].push(
                    scheduleTime
                  );
                }
                return courtTime;
              }

              const averageMatchUpMinutes =
                details.minutesMap?.[matchUpId]?.averageMinutes ||
                details.greatestAverageMinutes;

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
                schedulingConflicts.push(...conflicts);
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

              if (
                !courtTime.scheduleTime ||
                timeStringMinutes(scheduleTime) <
                  timeStringMinutes(courtTime.scheduleTime)
              ) {
                courtTime.averageMatchUpMinutes = averageMatchUpMinutes;
                courtTime.recoveryMinutes = recoveryMinutes;
                courtTime.scheduleTime = scheduleTime;
                courtTime.courtName = court.courtName;
                courtTime.courtId = court.courtId;
              }

              return courtTime;
            }, {});

            if (courtTime.scheduleTime) {
              const {
                averageMatchUpMinutes,
                recoveryMinutes,
                scheduleTime,
                courtId,
              } = courtTime;
              matchUpScheduleTimes[matchUpId] = scheduleTime;
              matchUpScheduleCourtIds[matchUpId] = courtId;
              matchUpIdsScheduled.push(matchUpId);
              courtIdsScheduled.push(courtId);

              const startTime = scheduleTime;
              const endTime = addMinutesToTimeString(
                startTime,
                averageMatchUpMinutes
              );
              const booking = {
                averageMatchUpMinutes,
                recoveryMinutes,
                periodLength,
                matchUpId,
                startTime,
                courtId,
                endTime,
                venueId,
              };

              addDateCourtBooking({ courtId, booking });

              details.matchUpsToSchedule = details.matchUpsToSchedule.filter(
                (matchUp) => matchUp.matchUpId !== matchUpId
              );
            } else {
              if (schedulingConflicts?.length) {
                if (!scheduleDateRequestConflicts[scheduleDate])
                  scheduleDateRequestConflicts[scheduleDate] = [];
                scheduleDateRequestConflicts[scheduleDate].push(
                  ...schedulingConflicts
                );
              }
            }
          }

          if (
            courtIdsScheduled.length === details.courtsCount ||
            matchUpIdsScheduled.length === details.courtsCount ||
            !details.matchUpsToSchedule.length
          ) {
            venuePassComplete = true;
          }
          if (
            details.matchUpsToSchedule.length &&
            matchUpIdsScheduled < details.courtsCount
          ) {
            if (
              timeToDate(venueEarliestCourtTime) <
              timeToDate(venueTimeBoundaries.endTime)
            ) {
              venueEarliestCourtTime = addMinutesToTimeString(
                venueEarliestCourtTime,
                periodLength
              );
            } else {
              venuePassComplete = true;
              details.complete = true;
            }
          }

          // this is necessary for scenarios where there are more courts than matches which can be scheduled at the same time
          passIterations += 1;
          if (!venuePassComplete && passIterations >= venuePassFailSafe) {
            venuePassComplete = true;
          }
        }

        if (!details.matchUpsToSchedule?.length) details.complete = true;
      }

      schedulingIterations += 1;
      schedulingComplete =
        venues.every(
          ({ venueId }) => venueScheduledRoundDetails[venueId].complete
        ) || schedulingIterations === failSafe;
    }

    // assign scheduledTime, venueId and courtId to each matchUp
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
                const courtId = matchUpScheduleCourtIds[matchUpId];
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
                    addMatchUpScheduledTime({
                      drawDefinition,
                      scheduledTime,
                      matchUpId,
                    });
                    assignMatchUpCourt({
                      courtDayDate: scheduleDate,
                      tournamentRecords,
                      tournamentRecord,
                      drawDefinition,
                      matchUpId,
                      courtId,
                    });
                    scheduledMatchUpIds[scheduleDate].push(matchUpId);
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
    }

    for (const venue of dateSchedulingProfile.venues) {
      for (const round of venue.rounds) {
        const matchUpIds = round.matchUps.map(({ matchUpId }) => matchUpId);
        const canScheduleMatchUpIds = matchUpIds.filter((matchUpId) =>
          scheduledMatchUpIds[scheduleDate].includes(matchUpId)
        );
        round.canScheduledMatchUpIds = canScheduleMatchUpIds;
        let possibleToSchedulePct =
          Math.round(
            (canScheduleMatchUpIds.length / round.matchUpsCount) * 10000
          ) / 100;
        if (possibleToSchedulePct === Infinity || isNaN(possibleToSchedulePct))
          possibleToSchedulePct = 0;
        round.possibleToSchedulePct = possibleToSchedulePct;
        if (round.matchUpsCount === canScheduleMatchUpIds.length) {
          round.possibleToSchedule = true;
        }
      }
    }
  }

  // returns the original form of the dateStrings, before extractDate()
  const scheduledDates = dateSchedulingProfiles.map(
    ({ scheduleDate }) => scheduleDate
  );

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
    dateSchedulingProfiles,

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
