import { decorateResult } from '@Functions/global/decorateResult';
import { isConvertableInteger } from '@Tools/math';
import { numericSortValue } from '@Tools/arrays';

// constants and types
import { INVALID_VALUES, MISSING_DRAW_DEFINITION } from '../../../constants/errorConditionConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import { ResultType } from '../../../types/factoryTypes';

export function setStructureOrder({ drawDefinition, orderMap }): ResultType {
  if (!drawDefinition) return { error: MISSING_DRAW_DEFINITION };
  if (typeof orderMap !== 'object' || !Object.values(orderMap).every((val) => isConvertableInteger(val)))
    decorateResult({
      result: { error: INVALID_VALUES },
      context: { orderMap },
    });

  if (!drawDefinition.structures) drawDefinition.structures = [];
  drawDefinition.structures.forEach((structure) => {
    const structureOrder = orderMap[structure.structureId];
    if (structureOrder) structure.structureOrder = structureOrder;
  });

  drawDefinition.structures.sort((a, b) => numericSortValue(a.structureOrder) - numericSortValue(b.structureOrder));

  return { ...SUCCESS };
}
