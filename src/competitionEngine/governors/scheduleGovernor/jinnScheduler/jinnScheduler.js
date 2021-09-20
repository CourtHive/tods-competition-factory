import { getContainedStructures } from '../../../../tournamentEngine/governors/tournamentGovernor/getContainedStructures';
import { assignMatchUpVenue } from '../../../../tournamentEngine/governors/scheduleGovernor/assignMatchUpVenue';
import { addTournamentTimeItem } from '../../../../tournamentEngine/governors/tournamentGovernor/addTimeItem';
import { addMatchUpScheduledTime } from '../../../../drawEngine/governors/matchUpGovernor/scheduleItems';
import { modifyParticipantMatchUpsCount } from '../scheduleMatchUps/modifyParticipantMatchUpsCount';
import { checkDependenciesScheduled } from '../scheduleMatchUps/checkDependenciesScheduled';
import { getScheduledRoundsDetails } from '../schedulingProfile/getScheduledRoundsDetails';
import { updateTimeAfterRecovery } from '../scheduleMatchUps/updateTimeAfterRecovery';
import { getDrawDefinition } from '../../../../tournamentEngine/getters/eventGetter';
import { calculateScheduleTimes } from '../scheduleMatchUps/calculateScheduleTimes';
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
import { getMatchUpDailyLimits } from '../getMatchUpDailyLimits';
import {
  extractDate,
  isValidDateString,
  sameDay,
  zeroPad,
} from '../../../../utilities/dateTime';

import { DO_NOT_SCHEDULE } from '../../../../constants/requestConstants';
import { SUCCESS } from '../../../../constants/resultConstants';
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
  tournamentRecords,
  scheduleDates = [],
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

  const scheduleDateRequestConflicts = {};
  const scheduledMatchUpIds = {};
  const overLimitMatchUpIds = {};
  const noTimeMatchUpIds = {};
  const requestConflicts = {};

  for (const dateSchedulingProfile of dateSchedulingProfiles) {
    const scheduleDate = extractDate(dateSchedulingProfile?.scheduleDate);
    const venues = dateSchedulingProfile?.venues || [];
    const matchUpPotentialParticipantIds = {};
    const individualParticipantProfiles = {};
    const venueScheduledRoundDetails = {};
    const matchUpScheduleTimes = {};

    scheduleTimesRemaining[scheduleDate] = {};
    scheduledMatchUpIds[scheduleDate] = [];
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
        orderedMatchUpIds,
        averageMinutesMap,
        recoveryMinutesMap,
        scheduledRoundsDetails,
        greatestAverageMinutes,
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
      const { scheduleTimes, dateScheduledMatchUpIds } = calculateScheduleTimes(
        {
          tournamentRecords,
          scheduleDate: extractDate(scheduleDate),
          averageMatchUpMinutes: groupedRounds[0].averageMinutes,
          venueIds: [venue.venueId],
          periodLength,
        }
      );

      // first build up a map of matchUpNotBeforeTimes and matchUpPotentialParticipantIds
      // based on already scheduled matchUps
      const alreadyScheduled = matchUps.filter(({ matchUpId }) =>
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
          const recoveryMinutes = recoveryMinutesMap?.[matchUp.matchUpId];
          const averageMatchUpMinutes = averageMinutesMap?.[matchUp.matchUpId];
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

      venueScheduledRoundDetails[venueId] = {
        courtsCount: courts.filter((court) => court.venueId === venueId).length,
        previousRemainingScheduleTimes: [], // keep track of sheduleTimes not used on previous iteration
        scheduledRoundsDetails,
        participantIdsAtLimit,
        matchUpsToSchedule,
        recoveryMinutesMap,
        scheduleTimes,
        groupedRounds,
        matchUpMap,
      };

      overLimitMatchUpIds[scheduleDate] = overLimitMatchUpIds;
    }

    // next generation scheduler // is single pass
    const failSafe = 1;
    let schedulingComplete;
    let schedulingIterations = 0;

    while (!schedulingComplete) {
      // for each venue schedule a round
      for (const { venueId } of venues) {
        let scheduledThisPass = 0;
        const details = venueScheduledRoundDetails[venueId];

        while (
          details.courtsCount &&
          details.scheduleTimes?.length &&
          details.matchUpsToSchedule?.length &&
          scheduledThisPass < details.courtsCount
        ) {
          // attempt to schedule a round or at least venue.courts.length matchUps
          const { scheduleTime } = details.scheduleTimes.shift();
          const scheduledMatchUp = details.matchUpsToSchedule.find(
            (matchUp) => {
              const { dependenciesScheduled } = checkDependenciesScheduled({
                matchUps,
                matchUpScheduleTimes,
                matchUpDependencies,
                allDateMatchUpIds,
                matchUp,
              });
              if (!dependenciesScheduled) return false;

              const recoveryMinutes =
                details.recoveryMinutesMap?.[matchUp.matchUpId];
              const averageMatchUpMinutes =
                details.averageMinutesMap?.[matchUp.matchUpId];
              const { enoughTime } = checkRecoveryTime({
                individualParticipantProfiles,
                matchUpPotentialParticipantIds,
                matchUpNotBeforeTimes,
                matchUpDependencies,

                recoveryMinutes,
                averageMatchUpMinutes,
                scheduleTime,
                scheduleDate,
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

              if (conflicts?.length) {
                if (!scheduleDateRequestConflicts[scheduleDate])
                  scheduleDateRequestConflicts[scheduleDate] = [];
                scheduleDateRequestConflicts[scheduleDate].push(...conflicts);
                return false;
              }

              matchUpScheduleTimes[matchUp.matchUpId] = scheduleTime;
              return true;
            }
          );

          details.matchUpsToSchedule = details.matchUpsToSchedule.filter(
            ({ matchUpId }) => matchUpId !== scheduledMatchUp?.matchUpId
          );

          if (!scheduledMatchUp) {
            skippedScheduleTimes[scheduleDate].push(scheduleTime);
          } else {
            scheduledThisPass += 1;
          }
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
        venueScheduledRoundDetails[venueId].scheduleTimes.map(
          ({ scheduleTime }) => scheduleTime
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

    scheduledDates,
    noTimeMatchUpIds,
    scheduledMatchUpIds,
    overLimitMatchUpIds,

    requestConflicts,
    skippedScheduleTimes,
    scheduleTimesRemaining,
  };
}
