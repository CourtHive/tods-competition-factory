import { newAddPlayoffStructures as addPlayoffs } from '../../../drawEngine/governors/structureGovernor/newAddPlayoffStructures';
import { addTournamentTimeItem } from '../tournamentGovernor/addTimeItem';

import { MISSING_TOURNAMENT_RECORD } from '../../../constants/errorConditionConstants';

export function addPlayoffStructures({
  playoffStructureNameBase,
  playoffAttributes,
  playoffPositions,
  exitProfileLimit,
  tournamentRecord,
  drawDefinition,
  roundProfiles,
  roundNumbers,
  structureId,
  idPrefix,
  event,
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
    event,
    uuids,
  });
  if (result.error) return result;

  const playoffDetails = {
    playoffStructureNameBase,
    playoffPositions,
    roundNumbers,
    structureId,
  };

  const timeItem = {
    itemType: 'addPlayoffStructures',
    itemValue: playoffDetails,
  };
  addTournamentTimeItem({ tournamentRecord, timeItem });

  return result;
}
