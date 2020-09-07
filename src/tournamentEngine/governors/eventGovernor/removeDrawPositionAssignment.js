import { findEvent } from '../../getters/eventGetter';
import { SUCCESS } from 'competitionFactory/constants/resultConstants';

export function removeDrawPositionAssignment(props) {
  const { tournamentRecord, drawEngine, drawId } = props;
  const { event, drawDefinition } = findEvent({tournamentRecord, drawId});

  let errors = [];

  const { errors: drawEngineErrors } = drawEngine.setState(drawDefinition);
  if (drawEngineErrors) errors = errors.concat(drawEngineErrors);

  if (event) {
    drawEngine.clearDrawPosition(props);
    const updatedDrawDefinition = drawEngine.getState();
    event.drawDefinitions = event.drawDefinitions.map(drawDefinition => {
      return drawDefinition.drawId === drawId ? updatedDrawDefinition : drawDefinition;   
    });
  } else {
    errors.push({ error: 'event not found' });
  }

  return (errors && errors.length) ? { errors } : SUCCESS;
}