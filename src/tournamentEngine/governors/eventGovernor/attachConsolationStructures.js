import { attachConsolationStructures as attachConsolation } from '../../../drawEngine/governors/structureGovernor/attachConsolationStructures';
import { addTournamentTimeItem } from '../tournamentGovernor/addTimeItem';

import {
  MISSING_DRAW_DEFINITION,
  MISSING_TOURNAMENT_RECORD,
} from '../../../constants/errorConditionConstants';

export function attachConsolationStructures({
  tournamentRecord,
  drawDefinition,
  structures,
  links,
}) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!drawDefinition) return { error: MISSING_DRAW_DEFINITION };

  const result = attachConsolation({
    tournamentRecord,
    drawDefinition,
    structures,
    links,
  });
  if (result.error) return result;

  const structureIds = structures?.map(({ structureId }) => structureId);
  const consolationDetails = { structureIds, drawId: drawDefinition.drawId };

  const timeItem = {
    itemType: 'attachConsolationStructures',
    itemValue: consolationDetails,
  };
  addTournamentTimeItem({ tournamentRecord, timeItem });

  return result;
}
