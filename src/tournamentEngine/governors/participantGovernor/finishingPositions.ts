import { getParticipantIdFinishingPositions as drawEngineGetParticipantIdFinishingPositions } from '../../../drawEngine/governors/queryGovernor/finishingPositions';

import { MISSING_TOURNAMENT_RECORD } from '../../../constants/errorConditionConstants';

/**
 *
 * @param {string} drawId - drawId of target draw within a tournament
 * @param {boolean} byeAdvancements - whether or not to consider byeAdancements in returns finishingPositionRange
 *
 */
export function getParticipantIdFinishingPositions({
  tournamentRecord,
  drawDefinition,
  byeAdvancements = false,
}) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };

  const tournamentParticipants = tournamentRecord.participants;

  return drawEngineGetParticipantIdFinishingPositions({
    tournamentParticipants,
    byeAdvancements,
    drawDefinition,
  });
}
