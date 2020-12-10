import { findEvent } from '../../getters/eventGetter';
import { SUCCESS } from '../../../constants/resultConstants';
import { EVENT_NOT_FOUND } from '../../../constants/errorConditionConstants';

export function removeDrawPositionAssignment(props) {
  const { tournamentRecord, drawEngine, drawId, deepCopy } = props;
  const { event, drawDefinition } = findEvent({ tournamentRecord, drawId });

  let errors = [];

  const { errors: drawEngineErrors } = drawEngine.setState(
    drawDefinition,
    deepCopy
  );
  if (drawEngineErrors) errors = errors.concat(drawEngineErrors);

  if (event) {
    drawEngine.clearDrawPosition(props);
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
