import { matchUpActions as drawEngineMatchupActions } from '../../drawEngine/governors/queryGovernor/matchUpActions';
import { allTournamentMatchUps } from './matchUpsGetter';

import {
  DRAW_DEFINITION_NOT_FOUND,
  MISSING_TOURNAMENT_RECORD,
} from '../../constants/errorConditionConstants';

/**
 *
 * return an array of all validActions for a given matchUp
 *
 * @param {object} tournamentRecord - provided automatically if tournamentEngine state has been set
 * @param {string} drawId - if provided then drawDefinition will be found automatically
 * @param {object} drawDefinition
 * @param {string} matchUpId - id of matchUp for which validActions will be returned
 *
 */
export function matchUpActions({
  tournamentRecord,
  drawDefinition,
  matchUpId,
  drawId,
}) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!drawId) {
    // if matchUp did not have context, find drawId by brute force
    const { matchUps } = allTournamentMatchUps({ tournamentRecord });
    drawId = matchUps.reduce((drawId, candidate) => {
      return candidate.matchUpId === matchUpId ? candidate.drawId : drawId;
    }, undefined);
    const events = tournamentRecord.events || [];
    const drawDefinitions = events
      .map((event) => event.drawDefinitions || [])
      .flat();
    drawDefinition = drawDefinitions.reduce((drawDefinition, candidate) => {
      return candidate.drawId === drawId ? candidate : drawDefinition;
    }, undefined);
  }

  if (drawId) {
    return drawEngineMatchupActions({ drawDefinition, matchUpId });
  } else {
    return { error: DRAW_DEFINITION_NOT_FOUND };
  }
}
