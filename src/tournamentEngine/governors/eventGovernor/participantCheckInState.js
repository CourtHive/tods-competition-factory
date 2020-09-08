import { findEvent } from '../../getters/eventGetter';
import { SUCCESS } from '../../../constants/resultConstants';

export function checkInParticipant(props) {
  Object.assign(props, { method: 'checkInParticipant' });
  return participantCheckInAction(props);
}

export function checkOutParticipant(props) {
  Object.assign(props, { method: 'checkOutParticipant' });
  return participantCheckInAction(props);
}

function participantCheckInAction({
  tournamentRecord, drawEngine,
  drawId, matchUpId, participantId,
  matchUp, method
}) {
  if (matchUp && !drawId) { ({drawId} = matchUp); }
  if (matchUp && !matchUpId) { ({matchUpId} = matchUp); }
  
  const { event, drawDefinition } = findEvent({tournamentRecord, drawId});

  let errors = [];

  const { errors: drawEngineErrors } = drawEngine
    .setState(drawDefinition)
    .setParticipants(tournamentRecord.participants);

  if (drawEngineErrors) errors = errors.concat(drawEngineErrors);
 
  if (event) {
    const result = drawEngine[method]({matchUpId, participantId});

    if (result.success) {
      event.drawDefinitions = event.drawDefinitions.map(drawDefinition => {
        return drawDefinition.drawId === drawId ? drawEngine.getState() : drawDefinition;   
      });
    } else {
      errors.push(result.error); 
    }
  } else {
    errors.push({ error: 'event not found' });
  }

  return (errors && errors.length) ? { errors } : SUCCESS;
}
