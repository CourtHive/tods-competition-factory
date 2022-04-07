import { resetScorecard as drawEngineResetScorecard } from '../../../drawEngine/governors/matchUpGovernor/resetScorecard';

/**
 *
 * @param {string} drawId - id of draw within which matchUp is found
 * @param {string} matchUpId - id of TEAM matchUp to be reset
 *
 */
export function resetScorecard(params) {
  const { tournamentRecord, drawDefinition, matchUpId, event } = params;

  return drawEngineResetScorecard({
    tournamentRecord,
    drawDefinition,
    matchUpId,
    event,
  });
}
