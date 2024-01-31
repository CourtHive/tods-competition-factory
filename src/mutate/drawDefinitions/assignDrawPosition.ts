import { assignDrawPositionBye as assignPositionBye } from '../matchUps/drawPositions/assignDrawPositionBye';
import { assignDrawPosition as assignPosition } from '../matchUps/drawPositions/positionAssignment';

import { SUCCESS } from '@Constants/resultConstants';
import {
  MISSING_DRAW_DEFINITION,
  MISSING_DRAW_POSITION,
  MISSING_STRUCTURE_ID,
  NOT_IMPLEMENTED,
} from '@Constants/errorConditionConstants';

export function assignDrawPosition({
  tournamentRecord,
  drawDefinition,
  participantId,
  drawPosition,
  structureId,
  qualifier,
  event,
  bye,
}) {
  if (!drawDefinition) return { error: MISSING_DRAW_DEFINITION };
  if (!drawPosition) return { error: MISSING_DRAW_POSITION };
  if (!structureId) return { error: MISSING_STRUCTURE_ID };

  if (bye) {
    const result = assignPositionBye({
      tournamentRecord,
      drawDefinition,
      drawPosition,
      structureId,
      event,
    });
    if (result.error) return result;
  } else if (qualifier) {
    return { error: NOT_IMPLEMENTED };
  } else {
    const result = assignPosition({
      tournamentRecord,
      drawDefinition,
      participantId,
      drawPosition,
      structureId,
      event,
    });
    if (result.error) return result;
  }

  return { ...SUCCESS };
}
