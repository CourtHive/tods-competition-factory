import { assignDrawPosition as assignPosition } from '../../../drawEngine/governors/positionGovernor/positionAssignment';
import { assignDrawPositionBye as assignPositionBye } from '../../../drawEngine/governors/positionGovernor/positionByes';

import { EVENT_NOT_FOUND } from '../../../constants/errorConditionConstants';
import { SUCCESS } from '../../../constants/resultConstants';

// TODO: untested...
export function assignDrawPosition(props) {
  const {
    bye,
    devContext,
    drawDefinition,
    drawPosition,
    participantId,
    qualifier,
    structureId,
  } = props;

  const errors = [];

  if (drawDefinition) {
    if (bye) {
      assignPositionBye({
        drawDefinition,
        drawPosition,
        structureId,
        devContext,
      });
    } else if (qualifier) {
      console.log('assign qualifier');
    } else {
      assignPosition({
        drawDefinition,
        structureId,
        drawPosition,
        participantId,
      });
    }
  } else {
    errors.push({ error: EVENT_NOT_FOUND });
  }

  return errors && errors.length ? { errors } : SUCCESS;
}
