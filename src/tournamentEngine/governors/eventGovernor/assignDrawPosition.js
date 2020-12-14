import { assignDrawPosition as assignPosition } from '../../../drawEngine/governors/positionGovernor';
import { assignDrawPositionBye as assignPositionBye } from '../../../drawEngine/governors/positionGovernor/positionByes';

import { EVENT_NOT_FOUND } from '../../../constants/errorConditionConstants';
import { SUCCESS } from '../../../constants/resultConstants';

// TODO: untested...
export function assignDrawPosition(props) {
  const {
    bye,
    drawDefinition,
    drawPosition,
    participantId,
    qualifier,
    structureId,
  } = props;

  const errors = [];

  if (drawDefinition) {
    if (bye) {
      assignPositionBye({ drawDefinition, structureId, drawPosition });
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
