import { getAllDrawMatchUps } from '../../getters/getMatchUps/drawMatchUps';
import { decorateResult } from '../../../global/functions/decorateResult';
import { getMatchUpsMap } from '../../getters/getMatchUps/getMatchUpsMap';
import { positionTargets } from '../positionGovernor/positionTargets';
import { findStructure } from '../../getters/findStructure';
import { isActiveDownstream } from './isActiveDownstream';
import { updateTieMatchUpScore } from './tieMatchUpScore';
import { setMatchUpStatus } from './setMatchUpStatus';
import { addGoesTo } from './addGoesTo';

import { SUCCESS } from '../../../constants/resultConstants';
import { TEAM } from '../../../constants/matchUpTypes';
import {
  MATCHUP_NOT_FOUND,
  MISSING_DRAW_DEFINITION,
  INVALID_VALUES,
  CANNOT_CHANGE_WINNING_SIDE,
  MISSING_MATCHUP_ID,
  INVALID_MATCHUP,
} from '../../../constants/errorConditionConstants';

/**
 *
 * @param {string} drawDefinition - required to collect all draw matchUps for scenario analysis
 * @param {string} matchUpId - id of the matchUp to be modified
 * @param {object} score - score object { sets: [] }
 * @param {string} matchUpStatus - optional - new matchUpStatus
 * @param {number} winningSide - optional - new winningSide; 1 or 2
 * @param {object} tournamentRecord - optional - used to discover relevant policyDefinitions or to modify scheduling information (integrity checks)
 * @returns
 */

export function resetScorecard(params) {
  const { tournamentRecord, drawDefinition, matchUpId, event } = params;
  const stack = 'resetScorecard';

  // Check for missing parameters ---------------------------------------------
  if (!drawDefinition)
    return decorateResult({
      result: { error: MISSING_DRAW_DEFINITION },
      stack,
    });
  if (!matchUpId)
    return decorateResult({ result: { error: MISSING_MATCHUP_ID }, stack });
  if (typeof matchUpId !== 'string')
    return decorateResult({
      result: { error: INVALID_VALUES, matchUpId },
      stack,
    });

  // Get map of all drawMatchUps and inContextDrawMatchUPs ---------------------
  const matchUpsMap = getMatchUpsMap({ drawDefinition });
  let { matchUps: inContextDrawMatchUps } = getAllDrawMatchUps({
    includeByeMatchUps: true,
    inContext: true,
    drawDefinition,
    matchUpsMap,
  });
  const hasGoesTo = !!inContextDrawMatchUps.find(
    ({ winnerMatchUpId, loserMatchUpId }) => winnerMatchUpId || loserMatchUpId
  );
  if (!hasGoesTo)
    ({ inContextDrawMatchUps } = addGoesTo({
      inContextDrawMatchUps,
      drawDefinition,
      matchUpsMap,
    }));

  // Find target matchUp ------------------------------------------------------
  const matchUp = matchUpsMap.drawMatchUps.find(
    (matchUp) => matchUp.matchUpId === matchUpId
  );

  const inContextMatchUp = inContextDrawMatchUps.find(
    (matchUp) => matchUp.matchUpId === matchUpId
  );

  if (!matchUp || !inContextDrawMatchUps) return { error: MATCHUP_NOT_FOUND };

  // only accept matchUpType: TEAM
  if (!matchUp.matchUpType === TEAM) return { error: INVALID_MATCHUP };

  // Get winner/loser position targets ----------------------------------------
  const targetData = positionTargets({
    inContextDrawMatchUps,
    drawDefinition,
    matchUpId,
  });

  const structureId = inContextMatchUp.structureId;
  const { structure } = findStructure({ drawDefinition, structureId });

  Object.assign(params, {
    inContextDrawMatchUps,
    inContextMatchUp,
    matchUpsMap,
    targetData,
    structure,
    matchUp,
  });

  // with propagating winningSide changes, activeDownstream only applies to eventType: TEAM
  const activeDownstream = isActiveDownstream(params);
  if (activeDownstream) return { error: CANNOT_CHANGE_WINNING_SIDE };

  for (const tieMatchUp of matchUp.tieMatchUps) {
    const result = setMatchUpStatus({
      matchUpId: tieMatchUp.matchUpId,
      matchUpTieId: matchUpId,
      winningSide: undefined,
      removeScore: true,
      tournamentRecord,
      drawDefinition,
      event,
    });
    if (result.error) return decorateResult({ result, stack });
  }

  const result = updateTieMatchUpScore({
    removeScore: true,
    tournamentRecord,
    drawDefinition,
    matchUpId,
  });
  if (result.error) return decorateResult({ result, stack });

  return { ...SUCCESS };
}
