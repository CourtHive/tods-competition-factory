import { addMatchUpScheduleItems } from '../../../drawEngine/governors/matchUpGovernor/scheduleItems';
import { allTournamentMatchUps } from '../../getters/matchUpsGetter';
import { getDrawDefinition } from '../../getters/eventGetter';

import { SUCCESS } from '../../../constants/resultConstants';
import {
  MISSING_SCHEDULE,
  MISSING_MATCHUP_IDS,
  MISSING_TOURNAMENT_RECORD,
} from '../../../constants/errorConditionConstants';

/**
 *
 * @param {object} tournamentRecord - passed in automatically by tournamentEngine
 * @param {string[]} matchUpIds - array of matchUpIds to be scheduled
 * @param {object} schedule - { venueId?: string; scheduledDate?: string; scheduledTime?: string }
 *
 */
export function bulkScheduleMatchUps({
  tournamentRecord,
  matchUpIds,
  schedule,
}) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!matchUpIds || !Array.isArray(matchUpIds))
    return { error: MISSING_MATCHUP_IDS };

  if (!schedule || typeof schedule !== 'object')
    return { error: MISSING_SCHEDULE };

  const { matchUps } = allTournamentMatchUps({ tournamentRecord });

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

  for (const drawId of Object.keys(drawIdMap)) {
    const { drawDefinition } = getDrawDefinition({
      tournamentRecord,
      drawId,
    });
    const drawMatchUpIds = drawIdMap[drawId].filter((matchUpId) =>
      matchUpIds.includes(matchUpId)
    );
    for (const matchUpId of drawMatchUpIds) {
      const result = addMatchUpScheduleItems({
        tournamentRecord,
        drawDefinition,
        matchUpId,
        schedule,
      });
      if (result.error) return result;
    }
  }

  return { ...SUCCESS };
}
