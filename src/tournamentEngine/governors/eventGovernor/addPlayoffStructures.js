import { addPlayoffStructures as addPlayoffs } from '../../../drawEngine/governors/structureGovernor/addPlayoffStructures';

import { MISSING_TOURNAMENT_RECORD } from '../../../constants/errorConditionConstants';
import { addTournamentTimeItem } from '../tournamentGovernor/addTimeItem';

export function addPlayoffStructures({
  tournamentRecord,
  drawDefinition,

  playoffStructureNameBase,
  playoffPositions,
  roundNumbers,
  structureId,
}) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };

  const result = addPlayoffs({
    drawDefinition,
    structureId,
    roundNumbers,
    playoffPositions,
    playoffStructureNameBase,
  });

  const playoffDetails = {
    structureId,
    roundNumbers,
    playoffPositions,
    playoffStructureNameBase,
  };

  const timeItem = {
    itemType: 'addPlayoffStructures',
    itemValue: playoffDetails,
  };
  addTournamentTimeItem({ tournamentRecord, timeItem });

  return result;
}
