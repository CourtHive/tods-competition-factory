import { addPlayoffStructures as addPlayoffs } from '../../../drawEngine/governors/structureGovernor/addPlayoffStructures';
import { addTournamentTimeItem } from '../tournamentGovernor/addTimeItem';

import { MISSING_TOURNAMENT_RECORD } from '../../../constants/errorConditionConstants';

export function addPlayoffStructures({
  tournamentRecord,
  drawDefinition,

  playoffStructureNameBase,
  playoffAttributes,
  playoffPositions,
  exitProfileLimit,
  roundNumbers,
  roundProfiles,
  structureId,
  uuids,
}) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };

  const result = addPlayoffs({
    drawDefinition,
    structureId,
    roundNumbers,
    roundProfiles,
    playoffPositions,
    playoffAttributes,
    playoffStructureNameBase,
    exitProfileLimit,
    uuids,
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
