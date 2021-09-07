import { getContainedStructures } from '../../../../tournamentEngine/governors/tournamentGovernor/getContainedStructures';
import { addTournamentTimeItem } from '../../../../tournamentEngine/governors/tournamentGovernor/addTimeItem';
import { extractDate, isValidDateString } from '../../../../utilities/dateTime';
import { allCompetitionMatchUps } from '../../../getters/matchUpsGetter';
import { scheduleMatchUps } from '../scheduleMatchUps/scheduleMatchUps';
import { getScheduledRoundDetails } from './getScheduledRoundDetails';
import { addNotice, getTopics } from '../../../../global/globalState';
import { getMatchUpDailyLimits } from '../getMatchUpDailyLimits';
import { getSchedulingProfile } from './schedulingProfile';

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

  const validScheduleDates = scheduleDates
    .map((date) => {
      if (!isValidDateString(date)) return;
      return extractDate(date);
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
      const date = extractDate(dateschedulingProfile?.scheduleDate);
      return profileDates.includes(date);
    })
    .sort((a, b) => {
      new Date(a.scheduleDate).getTime() - new Date(b.scheduleDate).getTime();
    });

  const noTimeMatchUpIds = [];
  const overLimitMatchUpIds = [];
  const scheduledMatchUpIds = [];
  const requestConflicts = [];
  const matchUpNotBeforeTimes = {};
  const matchUpPotentialParticipantIds = {};

  const remainingScheduleTimes = {};
  const skippedScheduleTimes = {};

  for (const dateSchedulingProfile of dateSchedulingProfiles) {
    const date = extractDate(dateSchedulingProfile?.scheduleDate);
    const venues = dateSchedulingProfile?.venues || [];

    for (const venue of venues) {
      const { rounds = [], venueId } = venue;

      const {
        recoveryMinutesMap,
        scheduledRoundsDetails,
        greatestAverageMinutes,
      } = getScheduledRoundDetails({
        tournamentRecords,
        containedStructureIds,
        periodLength,
        matchUps,
        rounds,
      });

      let lastHash;
      let groupedMatchUpIds = [];
      let averageMinutes;
      let recoveryMinutes;
      let roundPeriodLength;
      let groupedRounds = [];
      for (const roundDetails of scheduledRoundsDetails) {
        if (!lastHash || roundDetails.hash === lastHash || garmanSinglePass) {
          groupedMatchUpIds = groupedMatchUpIds.concat(roundDetails.matchUpIds);
        }

        if (lastHash && roundDetails.hash !== lastHash && !garmanSinglePass) {
          lastHash = roundDetails.hash;
          groupedRounds.push({
            averageMinutes,
            recoveryMinutes,
            roundPeriodLength,
            matchUpIds: groupedMatchUpIds,
          });
          groupedMatchUpIds = roundDetails.matchUpIds;
        }
        averageMinutes = garmanSinglePass
          ? greatestAverageMinutes
          : roundDetails.averageMinutes;
        recoveryMinutes = roundDetails.recoveryMinutes;
        roundPeriodLength = roundDetails.roundPeriodLength;
      }

      if (groupedMatchUpIds.length) {
        groupedRounds.push({
          averageMinutes,
          recoveryMinutes,
          roundPeriodLength,
          matchUpIds: groupedMatchUpIds,
        });
      }

      let previousRemainingScheduleTimes = []; // keep track of sheduleTimes not used on previous iteration
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

          averageMatchUpMinutes: averageMinutes,
          recoveryMinutesMap,
          recoveryMinutes,

          matchUpDailyLimits,
          matchUpNotBeforeTimes,
          matchUpPotentialParticipantIds,

          checkPotentialConflicts,
          remainingScheduleTimes: previousRemainingScheduleTimes,

          venueIds: [venueId],
          periodLength,
          matchUpIds,
          date,
        });
        if (result.error) return result;

        previousRemainingScheduleTimes = result.remainingScheduleTimes;
        if (result.skippedScheduleTimes?.length) {
          // add skippedScheduleTimes for each date and return for testing
          skippedScheduleTimes[date] = result.skippedScheduleTimes;
        }
        if (result.remainingScheduleTimes?.length) {
          // add remainingScheduleTimes for each date and return for testing
          remainingScheduleTimes[date] = result.remainingScheduleTimes;
        }

        const roundNoTimeMatchUpIds = result?.noTimeMatchUpIds || [];
        noTimeMatchUpIds.push(...roundNoTimeMatchUpIds);
        const roundScheduledMatchUpIds = result?.scheduledMatchUpIds || [];
        scheduledMatchUpIds.push(...roundScheduledMatchUpIds);
        const roundOverLimitMatchUpIds = result?.overLimitMatchUpIds || [];
        overLimitMatchUpIds.push(...roundOverLimitMatchUpIds);
        const conflicts = result?.requestConflicts || [];
        if (conflicts.length) requestConflicts.push({ date, conflicts });
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

    scheduledDates,
    noTimeMatchUpIds,
    scheduledMatchUpIds,
    overLimitMatchUpIds,

    requestConflicts,
    skippedScheduleTimes,
    remainingScheduleTimes,
  };
}
