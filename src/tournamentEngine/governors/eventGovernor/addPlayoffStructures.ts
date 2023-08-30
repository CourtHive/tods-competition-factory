import { addPlayoffStructures as addPlayoffs } from '../../../drawEngine/governors/structureGovernor/addPlayoffStructures';
import { addTournamentTimeItem } from '../tournamentGovernor/addTimeItem';
import { definedAttributes } from '../../../utilities/objects';

import { MISSING_TOURNAMENT_RECORD } from '../../../constants/errorConditionConstants';

export function addPlayoffStructures(params) {
  const tournamentRecord = params.tournamentRecord;
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };

  const result = addPlayoffs(params);
  if (result.error) return result;

  const {
    playoffStructureNameBase,
    playoffPositions,
    roundNumbers,
    structureId,
  } = params;

  const playoffDetails = definedAttributes({
    playoffStructureNameBase,
    playoffPositions,
    roundNumbers,
    structureId,
  });

  const timeItem = {
    itemType: 'addPlayoffStructures',
    itemValue: playoffDetails,
  };
  addTournamentTimeItem({ tournamentRecord, timeItem });

  return result;
}
