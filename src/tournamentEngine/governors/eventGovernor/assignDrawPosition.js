import { findEvent } from '../../getters/eventGetter';
import { SUCCESS } from '../../../constants/resultConstants';
import { EVENT_NOT_FOUND } from '../../../constants/errorConditionConstants';

// TODO: untested...
export function assignDrawPosition(props) {
  const {
    drawId,
    event,
    structureId,
    drawPosition,
    bye,
    participantId,
    qualifier,
  } = props;

  let errors = [];

  if (event) {
    if (bye) {
      drawEngine.assignDrawPositionBye({ structureId, drawPosition });
    } else if (qualifier) {
      console.log('assign qualifier');
    } else {
      drawEngine.assignDrawPosition({
        structureId,
        drawPosition,
        participantId,
      });
    }

    const { drawDefinition: updatedDrawDefinition } = drawEngine.getState();
    event.drawDefinitions = event.drawDefinitions.map(drawDefinition => {
      return drawDefinition.drawId === drawId
        ? updatedDrawDefinition
        : drawDefinition;
    });
  } else {
    errors.push({ error: EVENT_NOT_FOUND });
  }

  return errors && errors.length ? { errors } : SUCCESS;
}
