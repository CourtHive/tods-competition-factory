import { getContainedStructures } from '../../../../tournamentEngine/governors/tournamentGovernor/getContainedStructures';
import { addTournamentTimeItem } from '../../../../tournamentEngine/governors/tournamentGovernor/addTimeItem';
import { getMatchUpDependencies } from '../scheduleMatchUps/getMatchUpDependencies';
import { extractDate, isValidDateString } from '../../../../utilities/dateTime';
import { allCompetitionMatchUps } from '../../../getters/matchUpsGetter';
import { scheduleMatchUps } from '../scheduleMatchUps/scheduleMatchUps';
import { getScheduledRoundsDetails } from './getScheduledRoundsDetails';
import { addNotice, getTopics } from '../../../../global/globalState';
import { getMatchUpDailyLimits } from '../getMatchUpDailyLimits';
import { getSchedulingProfile } from './schedulingProfile';
import { getGroupedRounds } from './getGroupedRounds';

import { SUCCESS } from '../../../../constants/resultConstants';
import { AUDIT } from '../../../../constants/topicConstants';
import {
  INVALID_VALUES,
  MISSING_TOURNAMENT_RECORDS,
  NO_VALID_DATES,
} from '../../../../constants/errorConditionConstants';

export function scheduleProfileRounds({
  tournamentRecords,
  scheduleDates = [],
  periodLength,

  checkPotentialConflicts = true,
  garmanSinglePass = true, // forces all rounds to have greatestAverageMinutes
}) {
  if (!tournamentRecords) return { error: MISSING_TOURNAMENT_RECORDS };
  if (!Array.isArray(scheduleDates)) return { error: INVALID_VALUES };

  const schedulingProfile =
    getSchedulingProfile({ tournamentRecords })?.schedulingProfile || [];

  const { matchUpDailyLimits } = getMatchUpDailyLimits({ tournamentRecords });

  const containedStructureIds = Object.assign(
    {},
    ...Object.values(tournamentRecords).map(getContainedStructures)
  );

  const { matchUps } = allCompetitionMatchUps({
    tournamentRecords,
    nextMatchUps: true,
  });

  const { matchUpDependencies } = getMatchUpDependencies({
    includeParticipantDependencies: true,
    tournamentRecords,
    matchUps,
  });

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

  const scheduledMatchUpIds = [];
  const overLimitMatchUpIds = [];
  const noTimeMatchUpIds = [];
  const requestConflicts = [];

  let iterations = 0;

  for (const dateSchedulingProfile of dateSchedulingProfiles) {
    let previousRemainingScheduleTimes = []; // keep track of sheduleTimes not used on previous iteration
    const scheduleDate = extractDate(dateSchedulingProfile?.scheduleDate);
    const venues = dateSchedulingProfile?.venues || [];
    const matchUpPotentialParticipantIds = {};
    const individualParticipantProfiles = {};
    const venueScheduledRoundDetails = {};
    const matchUpNotBeforeTimes = {};

    const allDateMatchUpIds = [];

    // first pass through all venues is to build up an array of all matchUpIds in the schedulingProfile for current scheduleDate
    for (const venue of venues) {
      const { rounds = [], venueId } = venue;
      const {
        orderedMatchUpIds,
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

      venueScheduledRoundDetails[venueId] = {
        recoveryMinutesMap,
        scheduledRoundsDetails,
        greatestAverageMinutes,
      };
    }

    // second pass groups the rounds where possible, or groups all rounds if { garmanSinglePass: true }
    // ... and initiates scheduling
    for (const venue of venues) {
      const remainingScheduleTimes = {}; // remainingScheduleTimes has to be scoped to the current venue

      const { venueId } = venue;

      const {
        recoveryMinutesMap,
        scheduledRoundsDetails,
        greatestAverageMinutes,
      } = venueScheduledRoundDetails[venueId];

      const { groupedRounds } = getGroupedRounds({
        scheduledRoundsDetails,
        greatestAverageMinutes,
        garmanSinglePass,
      });

      iterations += groupedRounds.length;

      for (const roundDetail of groupedRounds) {
        const {
          matchUpIds,
          averageMinutes,
          recoveryMinutes,
          roundPeriodLength,
        } = roundDetail;
        periodLength = roundPeriodLength || periodLength;

        const result = scheduleMatchUps({
          tournamentRecords,
          competitionMatchUps: matchUps,
          matchUpDependencies,
          allDateMatchUpIds,

          averageMatchUpMinutes: averageMinutes,
          recoveryMinutesMap,
          recoveryMinutes,

          matchUpDailyLimits,
          matchUpNotBeforeTimes,
          matchUpPotentialParticipantIds,
          individualParticipantProfiles,

          checkPotentialConflicts,
          remainingScheduleTimes: previousRemainingScheduleTimes,

          venueIds: [venueId],
          periodLength,
          matchUpIds,
          scheduleDate,
        });
        if (result.error) return result;

        previousRemainingScheduleTimes = result.remainingScheduleTimes;
        if (result.skippedScheduleTimes?.length) {
          // add skippedScheduleTimes for each scheduleDate and return for testing
          skippedScheduleTimes[scheduleDate] = result.skippedScheduleTimes;
        }
        if (result.remainingScheduleTimes?.length) {
          // add remainingScheduleTimes for each scheduleDate and return for testing
          remainingScheduleTimes[scheduleDate] = result.remainingScheduleTimes;
        }

        const roundNoTimeMatchUpIds = result?.noTimeMatchUpIds || [];
        noTimeMatchUpIds.push(...roundNoTimeMatchUpIds);
        const roundScheduledMatchUpIds = result?.scheduledMatchUpIds || [];
        scheduledMatchUpIds.push(...roundScheduledMatchUpIds);
        const roundOverLimitMatchUpIds = result?.overLimitMatchUpIds || [];
        overLimitMatchUpIds.push(...roundOverLimitMatchUpIds);
        const conflicts = result?.requestConflicts || [];
        if (conflicts.length)
          requestConflicts.push({ date: scheduleDate, conflicts });
      }

      if (!scheduleTimesRemaining[venueId])
        scheduleTimesRemaining[venueId] = {};
      scheduleTimesRemaining[venueId][scheduleDate] = remainingScheduleTimes;
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
    iterations,

    scheduledDates,
    noTimeMatchUpIds,
    scheduledMatchUpIds,
    overLimitMatchUpIds,

    requestConflicts,
    skippedScheduleTimes,
    scheduleTimesRemaining,
  };
}
