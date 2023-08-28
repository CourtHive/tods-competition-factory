import { attachStructures as structuresAttachment } from '../../../drawEngine/governors/structureGovernor/attachStructures';
import { addTournamentTimeItem } from '../tournamentGovernor/addTimeItem';

import {
  MISSING_DRAW_DEFINITION,
  MISSING_TOURNAMENT_RECORD,
} from '../../../constants/errorConditionConstants';

export function attachConsolationStructures(params) {
  return attachStructures({
    ...params,
    itemType: 'attachConsolationStructures',
  });
}

export function attachPlayoffStructures(params) {
  return attachStructures({ ...params, itemType: 'attachPlayoffStructures' });
}

export function attachStructures({
  itemType = 'attachStructures',
  matchUpModifications,
  tournamentRecord,
  drawDefinition,
  structures,
  links,
}) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!drawDefinition) return { error: MISSING_DRAW_DEFINITION };

  const result = structuresAttachment({
    matchUpModifications,
    tournamentRecord,
    drawDefinition,
    structures,
    links,
  });
  if (result.error) return result;

  const structureIds = structures?.map(({ structureId }) => structureId);
  const itemValue = { structureIds, drawId: drawDefinition.drawId };

  const timeItem = {
    itemValue,
    itemType,
  };
  addTournamentTimeItem({ tournamentRecord, timeItem });

  return result;
}
