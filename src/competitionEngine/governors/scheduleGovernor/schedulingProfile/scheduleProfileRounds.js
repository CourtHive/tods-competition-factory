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
  dryRun,

  checkPotentialRequestConflicts = true,
  garmanSinglePass = true, // forces all rounds to have greatestAverageMinutes
}) {
  if (!tournamentRecords) return { error: MISSING_TOURNAMENT_RECORDS };
  if (!Array.isArray(scheduleDates)) return { error: INVALID_VALUES };

  const {
    schedulingProfile = [],
    issues: schedulingProfileIssues = [],
    modifications: schedulingProfileModifications,
  } = getSchedulingProfile({ tournamentRecords });

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

  const scheduledMatchUpIds = {};
  const overLimitMatchUpIds = {};
  const noTimeMatchUpIds = {};
  const requestConflicts = {};

  let iterations = 0;

  for (const dateSchedulingProfile of dateSchedulingProfiles) {
    const scheduleDate = extractDate(dateSchedulingProfile?.scheduleDate);
    const venues = dateSchedulingProfile?.venues || [];
    const matchUpPotentialParticipantIds = {};
    const individualParticipantProfiles = {};
    const venueScheduledRoundDetails = {};
    const matchUpNotBeforeTimes = {};

    scheduleTimesRemaining[scheduleDate] = {};
    scheduledMatchUpIds[scheduleDate] = [];
    overLimitMatchUpIds[scheduleDate] = [];
    noTimeMatchUpIds[scheduleDate] = [];
    requestConflicts[scheduleDate] = [];

    // checking that matchUpDependencies are scheduled is scoped to only those matchUps that are to be scheduled on the same date
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
      let previousRemainingScheduleTimes = []; // keep track of sheduleTimes not used on previous iteration
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
          checkPotentialRequestConflicts, // whether to consider personal requests when scheduling potential matchUps
          tournamentRecords,
          dryRun,

          remainingScheduleTimes: previousRemainingScheduleTimes,
          averageMatchUpMinutes: averageMinutes,
          recoveryMinutesMap,
          recoveryMinutes,
          periodLength,
          scheduleDate,

          // id maps
          matchUpPotentialParticipantIds,
          individualParticipantProfiles,
          matchUpNotBeforeTimes,
          matchUpDependencies,
          matchUpDailyLimits,

          competitionMatchUps: matchUps,
          venueIds: [venueId],
          allDateMatchUpIds,
          matchUpIds,
        });
        if (result.error) return result;

        previousRemainingScheduleTimes = result.remainingScheduleTimes;
        if (result.skippedScheduleTimes?.length) {
          // add skippedScheduleTimes for each scheduleDate and return for testing
          skippedScheduleTimes[scheduleDate] = result.skippedScheduleTimes;
        }
        if (result.remainingScheduleTimes?.length) {
          // add remainingScheduleTimes for each scheduleDate and return for testing
          scheduleTimesRemaining[scheduleDate][venueId] =
            result.remainingScheduleTimes;
        }

        const roundNoTimeMatchUpIds = result?.noTimeMatchUpIds || [];
        noTimeMatchUpIds[scheduleDate].push(...roundNoTimeMatchUpIds);
        const roundScheduledMatchUpIds = result?.scheduledMatchUpIds || [];
        scheduledMatchUpIds[scheduleDate].push(...roundScheduledMatchUpIds);
        const roundOverLimitMatchUpIds = result?.overLimitMatchUpIds || [];
        overLimitMatchUpIds[scheduleDate].push(...roundOverLimitMatchUpIds);
        const conflicts = result?.requestConflicts || [];
        if (conflicts.length)
          requestConflicts[scheduleDate].push({
            date: scheduleDate,
            conflicts,
          });
      }
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
