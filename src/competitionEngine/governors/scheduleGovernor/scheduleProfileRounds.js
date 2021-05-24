import { filterMatchUps } from '../../../drawEngine/getters/getMatchUps/filterMatchUps';
import { findMatchUpFormatTiming } from './matchUpFormatTiming/findMatchUpFormatTiming';
import { getMatchUpFormat } from '../../../tournamentEngine/getters/getMatchUpFormat';
import { findEvent } from '../../../tournamentEngine/getters/eventGetter';
import { allCompetitionMatchUps } from '../../getters/matchUpsGetter';
import { getSchedulingProfile } from './schedulingProfile';
import { extractDate } from '../../../utilities/dateTime';
import { scheduleMatchUps } from './scheduleMatchUps';

import { MISSING_TOURNAMENT_RECORDS } from '../../../constants/errorConditionConstants';
import { SUCCESS } from '../../../constants/resultConstants';

export function scheduleProfileRounds({ tournamentRecords }) {
  if (!tournamentRecords) return { error: MISSING_TOURNAMENT_RECORDS };

  const schedulingProfile =
    getSchedulingProfile({ tournamentRecords })?.schedulingProfile || [];

  const competitionMatchUpFilters = {};
  const { matchUps } = allCompetitionMatchUps({
    tournamentRecords,
    matchUpFilters: competitionMatchUpFilters,
  });

  for (const dateSchedulingPofile of schedulingProfile) {
    const venues = dateSchedulingPofile?.venues || [];
    const date = extractDate(dateSchedulingPofile?.scheduleDate);

    for (const venue of venues) {
      const { rounds, venueId } = venue;

      for (const round of rounds) {
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
        if (result.error) return result;
      }
    }
  }

  return SUCCESS;
}
