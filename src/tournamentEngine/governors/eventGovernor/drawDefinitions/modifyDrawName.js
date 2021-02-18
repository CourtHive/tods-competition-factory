import {
  INVALID_VALUES,
  MISSING_DRAW_DEFINITION,
} from '../../../../constants/errorConditionConstants';
import { SUCCESS } from '../../../../constants/resultConstants';

export function modifyDrawName({ drawDefinition, drawName }) {
  if (!drawDefinition) return { error: MISSING_DRAW_DEFINITION };
  if (!drawName || typeof drawName !== 'string')
    return { error: INVALID_VALUES, drawName };

  drawDefinition.drawName = drawName;

  return SUCCESS;
}
