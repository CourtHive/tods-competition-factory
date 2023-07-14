import { isObject } from '../../../utilities/objects';

import { SUCCESS } from '../../../constants/resultConstants';
import {
  INVALID_VALUES,
  MISSING_DRAW_DEFINITION,
  MISSING_VALUE,
} from '../../../constants/errorConditionConstants';

export function renameStructures({ drawDefinition, structureDetails }) {
  if (!isObject(structureDetails)) return { error: INVALID_VALUES };
  if (!drawDefinition) return { error: MISSING_DRAW_DEFINITION };

  const detailMap = Object.assign(
    {},
    ...structureDetails
      .map((detail) => {
        if (!isObject(detail)) return;
        const { structureId, structureName } = detail || {};
        if (!structureId && structureName) return;
        return { [structureId]: structureName };
      })
      .filter(Boolean)
  );

  if (!Object.values(detailMap).length) {
    return { error: MISSING_VALUE };
  }

  let modificationsApplied = 0;
  for (const structure of drawDefinition.structures || []) {
    const structureName = detailMap[structure.structureId];
    if (structureName) {
      structure.structureName = structureName;
      modificationsApplied += 1;
    }
  }

  return { ...SUCCESS, modificationsApplied };
}
