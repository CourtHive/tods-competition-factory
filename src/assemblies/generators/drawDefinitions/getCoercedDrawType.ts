import { MULTI_STRUCTURE_DRAWS, SINGLE_ELIMINATION } from '../../../constants/drawDefinitionConstants';
import { ResultType, decorateResult } from '../../../global/functions/decorateResult';
import { INVALID_DRAW_SIZE } from '../../../constants/errorConditionConstants';

export function getCoercedDrawType(params): ResultType & { drawType?: string } {
  const { drawSize, drawTypeCoercion, enforceMinimumDrawSize } = params;

  let drawType =
    (drawTypeCoercion &&
      (typeof drawTypeCoercion === 'boolean' || drawTypeCoercion <= 2) &&
      drawSize === 2 &&
      SINGLE_ELIMINATION) ||
    params.drawType ||
    SINGLE_ELIMINATION;

  const multiStructure = MULTI_STRUCTURE_DRAWS.includes(drawType);
  if (drawSize && multiStructure) {
    if (drawTypeCoercion && ((typeof drawTypeCoercion === 'boolean' && drawSize < 4) || drawSize <= drawTypeCoercion)) {
      drawType = SINGLE_ELIMINATION;
    } else if (drawSize < 4 && enforceMinimumDrawSize) {
      return decorateResult({
        context: {
          enforceMinimumDrawSize,
          drawSize,
          drawType,
        },
        result: { error: INVALID_DRAW_SIZE },
        stack: 'getCoercedDrawType',
      });
    }
  }
  return { drawType };
}
