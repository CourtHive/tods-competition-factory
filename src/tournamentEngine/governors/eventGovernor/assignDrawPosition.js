import { findEvent } from '../../getters/eventGetter';
import { SUCCESS } from 'src/constants/resultConstants';

export function assignDrawPosition(props) {
  const {tournamentRecord, drawEngine, drawId, structureId, drawPosition, bye, participantId, qualifier} = props;
  const { event, drawDefinition } = findEvent({tournamentRecord, drawId});
 
  let errors = [];

  const { errors: drawEngineErrors } = drawEngine.setState(drawDefinition);
  if (drawEngineErrors) errors = errors.concat(drawEngineErrors);
 
  if (event) {
    if (bye) {
      drawEngine.assignDrawPositionBye({structureId, drawPosition});
    } else if (qualifier) {
      console.log('assign qualifier');
    } else {
      drawEngine.assignDrawPosition({structureId, drawPosition, participantId});
    }

    event.drawDefinitions = event.drawDefinitions.map(drawDefinition => {
      return drawDefinition.drawId === drawId ? drawEngine.getState() : drawDefinition;   
    });
  } else {
    errors.push({ error: 'event not found' });
  }

  return (errors && errors.length) ? { errors } : SUCCESS;
}
