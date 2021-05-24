import { filterMatchUps } from '../../../drawEngine/getters/getMatchUps/filterMatchUps';
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
    const date = extractDate(dateSchedulingPofile?.dateSchedule);

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
          ...roundMatchUpFilters,
        });
        const matchUpIds = roundMatchUps.map(({ matchUpId }) => matchUpId);

        console.log({ date, matchUps });
        const result = scheduleMatchUps({
          tournamentRecords,
          venueIds: [venueId],
          matchUpIds,
          date,
        });
        console.log(result);
      }
    }
  }

  return SUCCESS;
}
