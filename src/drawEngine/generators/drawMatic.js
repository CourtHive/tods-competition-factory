import { INVALID_DRAW_DEFINITION } from '../../constants/errorConditionConstants';
import { SUCCESS } from '../../constants/resultConstants';

export function drawMatic({ drawDefinition }) {
  if (typeof drawDefinition !== 'object')
    return { error: INVALID_DRAW_DEFINITION };

  return { ...SUCCESS };
}
