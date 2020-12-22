import { MISSING_TOURNAMENT_RECORD } from '../../../constants/errorConditionConstants';
import { addPlayoffStructures as addPlayoffs } from '../../../drawEngine/governors/structureGovernor/addPlayoffStructures';

export function addPlayoffStructures({
  tournamentRecord,
  drawDefinition,

  playoffPositions,
  roundNumbers,
  structureId,
}) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };

  return addPlayoffs({
    drawDefinition,
    structureId,
    roundNumbers,
    playoffPositions,
  });
}
