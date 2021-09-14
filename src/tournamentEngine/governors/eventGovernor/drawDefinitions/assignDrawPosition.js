import { assignDrawPositionBye as assignPositionBye } from '../../../../drawEngine/governors/positionGovernor/byePositioning/assignDrawPositionBye';
import { assignDrawPosition as assignPosition } from '../../../../drawEngine/governors/positionGovernor/positionAssignment';

import { SUCCESS } from '../../../../constants/resultConstants';
import {
  MISSING_DRAW_DEFINITION,
  MISSING_DRAW_POSITION,
  MISSING_STRUCTURE_ID,
  NOT_IMPLEMENTED,
} from '../../../../constants/errorConditionConstants';

export function assignDrawPosition({
  drawDefinition,
  drawPosition,
  structureId,
  participantId,
  qualifier,
  bye,
}) {
  if (!drawDefinition) return { error: MISSING_DRAW_DEFINITION };
  if (!drawPosition) return { error: MISSING_DRAW_POSITION };
  if (!structureId) return { error: MISSING_STRUCTURE_ID };

  if (bye) {
    const result = assignPositionBye({
      drawDefinition,
      drawPosition,
      structureId,
    });
    if (result.error) return result;
  } else if (qualifier) {
    return { error: NOT_IMPLEMENTED };
  } else {
    const result = assignPosition({
      drawDefinition,
      structureId,
      drawPosition,
      participantId,
    });
    if (result.error) return result;
  }

  return { ...SUCCESS };
}
