import { findEvent } from '../../getters/eventGetter';
import { SUCCESS } from '../../../constants/resultConstants';
import { EVENT_NOT_FOUND } from '../../../constants/errorConditionConstants';

export function assignDrawPosition(props) {
  const {
    tournamentRecord,
    drawEngine,
    drawId,
    structureId,
    drawPosition,
    bye,
    participantId,
    qualifier,
  } = props;
  const { event, drawDefinition } = findEvent({ tournamentRecord, drawId });

  let errors = [];

  const { errors: drawEngineErrors } = drawEngine.setState(drawDefinition);
  if (drawEngineErrors) errors = errors.concat(drawEngineErrors);

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
