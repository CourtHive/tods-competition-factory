import { isConvertableInteger } from '../../../utilities/math';
import { numericSortValue } from '../../../utilities/arrays';
import {
  ResultType,
  decorateResult,
} from '../../../global/functions/decorateResult';

import { SUCCESS } from '../../../constants/resultConstants';
import {
  INVALID_VALUES,
  MISSING_DRAW_DEFINITION,
} from '../../../constants/errorConditionConstants';

export function setStructureOrder({ drawDefinition, orderMap }): ResultType {
  if (!drawDefinition) return { error: MISSING_DRAW_DEFINITION };
  if (
    typeof orderMap !== 'object' ||
    !Object.values(orderMap).every((val) => isConvertableInteger(val))
  )
    decorateResult({
      result: { error: INVALID_VALUES },
      context: { orderMap },
    });

  if (!drawDefinition.structures) drawDefinition.structures = [];
  drawDefinition.structures.forEach((structure) => {
    const structureOrder = orderMap[structure.structureId];
    if (structureOrder) structure.structureOrder = structureOrder;
  });

  drawDefinition.structures.sort(
    (a, b) =>
      numericSortValue(a.structureOrder) - numericSortValue(b.structureOrder)
  );

  return { ...SUCCESS };
}
