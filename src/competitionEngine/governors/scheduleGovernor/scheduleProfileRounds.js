import { filterMatchUps } from '../../../drawEngine/getters/getMatchUps/filterMatchUps';
import { findMatchUpFormatTiming } from './matchUpFormatTiming/findMatchUpFormatTiming';
import { getMatchUpFormat } from '../../../tournamentEngine/getters/getMatchUpFormat';
import { extractDate, isValidDateString } from '../../../utilities/dateTime';
import { findEvent } from '../../../tournamentEngine/getters/eventGetter';
import { allCompetitionMatchUps } from '../../getters/matchUpsGetter';
import { getSchedulingProfile } from './schedulingProfile';
import { scheduleMatchUps } from './scheduleMatchUps';

import {
  INVALID_VALUES,
  MISSING_TOURNAMENT_RECORDS,
  NO_VALID_DATES,
} from '../../../constants/errorConditionConstants';
import { SUCCESS } from '../../../constants/resultConstants';

export function scheduleProfileRounds({
  tournamentRecords,
  scheduleDates = [],
}) {
  if (!tournamentRecords) return { error: MISSING_TOURNAMENT_RECORDS };
  if (!Array.isArray(scheduleDates)) return { error: INVALID_VALUES };

  const schedulingProfile =
    getSchedulingProfile({ tournamentRecords })?.schedulingProfile || [];

  const competitionMatchUpFilters = {};
  const { matchUps } = allCompetitionMatchUps({
    tournamentRecords,
    matchUpFilters: competitionMatchUpFilters,
  });

  const validScheduleDates = scheduleDates
    .map((date) => {
      if (!isValidDateString(date)) return;
      return extractDate(date);
    })
    .filter((f) => f);

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

  const scheduledMatchUpIds = [];
  for (const dateschedulingProfile of dateSchedulingProfiles) {
    const venues = dateschedulingProfile?.venues || [];
    const date = extractDate(dateschedulingProfile?.scheduleDate);

    for (const venue of venues) {
      const { rounds = [], venueId } = venue;

      const sortedRounds = rounds.sort(
        (a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)
      );

      for (const round of sortedRounds) {
        const roundMatchUpFilters = {
          tournamentIds: [round.tournamentId],
          eventIds: [round.eventId],
          drawIds: [round.drawId],
          structureids: [round.structureId],
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
        const { averageMinutes /*, recoveryMinutes */ } =
          findMatchUpFormatTiming({
            tournamentRecords,
            categoryName: categoryName || ageCategoryCode,
            tournamentId: round.tournamentId,
            eventId: round.eventId,
            matchUpFormat,
            eventType,
          });

        const result = scheduleMatchUps({
          tournamentRecords,
          averageMatchUpTime: averageMinutes,
          venueIds: [venueId],
          matchUpIds,
          date,
        });
        const roundScheduledMatchUpIds = result?.scheduledMatchUpIds || [];
        scheduledMatchUpIds.push(...roundScheduledMatchUpIds);
        if (result.error) return result;
      }
    }
  }

  // returns the original form of the dateStrings, before extractDate()
  const scheduledDates = dateSchedulingProfiles.map(
    ({ scheduleDate }) => scheduleDate
  );

  return Object.assign({}, SUCCESS, { scheduledDates, scheduledMatchUpIds });
}
