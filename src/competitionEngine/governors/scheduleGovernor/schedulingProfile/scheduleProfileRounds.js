import { filterMatchUps } from '../../../../drawEngine/getters/getMatchUps/filterMatchUps';
import { findMatchUpFormatTiming } from '../matchUpFormatTiming/findMatchUpFormatTiming';
import { getMatchUpFormat } from '../../../../tournamentEngine/getters/getMatchUpFormat';
import { extractDate, isValidDateString } from '../../../../utilities/dateTime';
import { findEvent } from '../../../../tournamentEngine/getters/eventGetter';
import { allCompetitionMatchUps } from '../../../getters/matchUpsGetter';
import { scheduleMatchUps } from '../scheduleMatchUps/scheduleMatchUps';
import { getMatchUpDailyLimits } from '../getMatchUpDailyLimits';
import { getSchedulingProfile } from './schedulingProfile';

import { SUCCESS } from '../../../../constants/resultConstants';
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
}) {
  if (!tournamentRecords) return { error: MISSING_TOURNAMENT_RECORDS };
  if (!Array.isArray(scheduleDates)) return { error: INVALID_VALUES };

  const schedulingProfile =
    getSchedulingProfile({ tournamentRecords })?.schedulingProfile || [];

  const { matchUpDailyLimits } = getMatchUpDailyLimits({ tournamentRecords });

  const competitionMatchUpFilters = {};
  const { matchUps } = allCompetitionMatchUps({
    tournamentRecords,
    matchUpFilters: competitionMatchUpFilters,
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

  for (const dateSchedulingProfile of dateSchedulingProfiles) {
    const date = extractDate(dateSchedulingProfile?.scheduleDate);
    const venues = dateSchedulingProfile?.venues || [];

    for (const venue of venues) {
      const { rounds = [], venueId } = venue;

      const sortedRounds = rounds.sort(
        (a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)
      );

      for (const round of sortedRounds) {
        periodLength =
          round.periodLength ||
          dateSchedulingProfile?.periodLength ||
          periodLength;

        // TODO: capture range of matchUps within a round
        // e.g. a round has been split between two venues
        // for elimation roundPositionRange could work..., but not for RR
        // for Round Robins you want to keep the groups together at a venue
        const roundMatchUpFilters = {
          tournamentIds: [round.tournamentId],
          eventIds: [round.eventId],
          drawIds: [round.drawId],
          structureIds: [round.structureId],
          roundNumbers: [round.roundNumber],
        };

        const roundMatchUps = filterMatchUps({
          matchUps,
          processContext: true,
          ...roundMatchUpFilters,
        });
        const matchUpIds = roundMatchUps.map(({ matchUpId }) => matchUpId);

        const tournamentRecord = tournamentRecords[round.tournamentId];
        const { drawDefinition, event } = findEvent({
          tournamentRecord,
          drawId: round.drawId,
        });
        const { matchUpFormat } = getMatchUpFormat({
          tournamentRecord,
          structureId: round.structureId,
          drawDefinition,
          event,
        });

        const { eventType, category } = event || {};
        const { categoryName, ageCategoryCode } = category || {};
        const { averageMinutes, recoveryMinutes } = findMatchUpFormatTiming({
          tournamentRecords,
          categoryName: categoryName || ageCategoryCode,
          tournamentId: round.tournamentId,
          eventId: round.eventId,
          matchUpFormat,
          eventType,
        });

        // a potential optimization is to check the matchUpFormatTiming for sequential rounds
        // use an aggregator `roundScheduleDetails` and then bulk schedule rounds with equivalent averageMinutes
        // roundScheduleDetails = [{ averageMinutes, recoveryMinutes, periodLength, matchUpIds }]

        const result = scheduleMatchUps({
          tournamentRecords,

          matchUpDailyLimits,
          averageMatchUpMinutes: averageMinutes,
          recoveryMinutes,

          checkPotentialConflicts,

          venueIds: [venueId],
          periodLength,
          matchUpIds,
          date,
        });
        if (result.error) return result;

        const roundNoTimeMatchUpIds = result?.noTimeMatchUpIds || [];
        noTimeMatchUpIds.push(...roundNoTimeMatchUpIds);
        const roundScheduledMatchUpIds = result?.scheduledMatchUpIds || [];
        scheduledMatchUpIds.push(...roundScheduledMatchUpIds);
        const roundOverLimitMatchUpIds = result?.overLimitMatchUpIds || [];
        overLimitMatchUpIds.push(...roundOverLimitMatchUpIds);
        const conflicts = result?.requestConflicts || [];
        requestConflicts.push({ date, conflicts });
      }
    }
  }

  // returns the original form of the dateStrings, before extractDate()
  const scheduledDates = dateSchedulingProfiles.map(
    ({ scheduleDate }) => scheduleDate
  );

  return {
    ...SUCCESS,
    scheduledDates,
    scheduledMatchUpIds,
    overLimitMatchUpIds,
    requestConflicts,
  };
}
