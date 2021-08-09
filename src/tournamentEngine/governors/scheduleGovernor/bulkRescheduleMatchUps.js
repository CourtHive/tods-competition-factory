import { allTournamentMatchUps } from '../../getters/matchUpsGetter';
import { getVenuesAndCourts } from '../../getters/venueGetter';

import { SUCCESS } from '../../../constants/resultConstants';
import {
  MISSING_MATCHUP_IDS,
  MISSING_TOURNAMENT_RECORD,
} from '../../../constants/errorConditionConstants';

/**
 *
 * @param {object} tournamentRecord - passed in automatically by tournamentEngine
 * @param {string[]} matchUpIds - array of matchUpIds to be scheduled
 *
 */
export function bulkRescheduleMatchUps({ tournamentRecord, matchUpIds }) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!matchUpIds || !Array.isArray(matchUpIds))
    return { error: MISSING_MATCHUP_IDS };

  const { matchUps, error } = allTournamentMatchUps({
    tournamentRecord,
    matchUpFilters: { matchUpIds },
  });
  if (error) return { error };

  const { courts } = getVenuesAndCourts({ tournamentRecord });

  // first organize matchUpIds by drawId
  const drawIdMap = matchUps.reduce((drawIdMap, matchUp) => {
    const { matchUpId, drawId } = matchUp;
    if (drawIdMap[drawId]) {
      drawIdMap[drawId].push(matchUpId);
    } else {
      drawIdMap[drawId] = [matchUpId];
    }
    return drawIdMap;
  }, {});

  console.log({ courts, drawIdMap });
  return { ...SUCCESS };
}
