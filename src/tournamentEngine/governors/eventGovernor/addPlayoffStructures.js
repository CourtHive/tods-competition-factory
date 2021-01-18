import { addPlayoffStructures as addPlayoffs } from '../../../drawEngine/governors/structureGovernor/addPlayoffStructures';

import { MISSING_TOURNAMENT_RECORD } from '../../../constants/errorConditionConstants';

export function addPlayoffStructures({
  tournamentRecord,
  drawDefinition,

  playoffStructureNameBase,
  playoffPositions,
  roundNumbers,
  structureId,

  devContext,
}) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };

  return addPlayoffs({
    drawDefinition,
    devContext,
    structureId,
    roundNumbers,
    playoffPositions,
    playoffStructureNameBase,
  });
}
