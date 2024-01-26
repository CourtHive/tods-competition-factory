import { isObject } from '../../../tools/objects';

import { ResultType } from '../../../functions/global/decorateResult';
import { DrawDefinition } from '../../../types/tournamentTypes';
import { SUCCESS } from '../../../constants/resultConstants';
import { INVALID_VALUES, MISSING_DRAW_DEFINITION, MISSING_VALUE } from '../../../constants/errorConditionConstants';

type RenameStructuresArgs = {
  drawDefinition: DrawDefinition;
  structureDetails: { structureId: string; structureName: string }[];
};

export function renameStructures({ drawDefinition, structureDetails }: RenameStructuresArgs): ResultType {
  if (!Array.isArray(structureDetails)) return { error: INVALID_VALUES };
  if (!drawDefinition) return { error: MISSING_DRAW_DEFINITION };

  const detailMap = Object.assign(
    {},
    ...structureDetails
      .map((detail) => {
        if (!isObject(detail)) return;
        const { structureId, structureName } = detail || {};
        if (!structureId || !structureName) return;
        return { [structureId]: structureName };
      })
      .filter(Boolean),
  );

  if (!Object.values(detailMap).length) {
    return { error: MISSING_VALUE };
  }

  for (const structure of drawDefinition.structures || []) {
    const structureName = detailMap[structure.structureId];
    if (structureName) {
      structure.structureName = structureName;
    }
  }

  return { ...SUCCESS };
}
