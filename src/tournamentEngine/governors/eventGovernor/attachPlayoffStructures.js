import { attachPlayoffStructures as attachPlayoffs } from '../../../drawEngine/governors/structureGovernor/attachPlayoffStructures';
import { addTournamentTimeItem } from '../tournamentGovernor/addTimeItem';

import {
  MISSING_DRAW_DEFINITION,
  MISSING_TOURNAMENT_RECORD,
} from '../../../constants/errorConditionConstants';

export function attachPlayoffStructures({
  tournamentRecord,
  drawDefinition,
  structures,
  links,
}) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!drawDefinition) return { error: MISSING_DRAW_DEFINITION };

  const result = attachPlayoffs({ drawDefinition, structures, links });
  if (result.error) return result;

  const structureIds = structures?.map(({ structureId }) => structureId);
  const playoffDetails = { structureIds, drawId: drawDefinition.drawId };

  const timeItem = {
    itemType: 'attachPlayoffStructures',
    itemValue: playoffDetails,
  };
  addTournamentTimeItem({ tournamentRecord, timeItem });

  return result;
}
