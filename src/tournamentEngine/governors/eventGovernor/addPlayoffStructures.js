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
  roundProfiles,
  roundNumbers,
  structureId,
  idPrefix,
  uuids,
}) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };

  const result = addPlayoffs({
    playoffStructureNameBase,
    playoffAttributes,
    playoffPositions,
    exitProfileLimit,
    drawDefinition,
    roundProfiles,
    roundNumbers,
    structureId,
    idPrefix,
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
