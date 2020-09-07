import { findEvent } from '../../getters/eventGetter';
import { SUCCESS } from 'src/constants/resultConstants';

export function deleteDrawDefinitions({tournamentRecord, eventId, drawIds}) {
  let { event } = findEvent({tournamentRecord, eventId});

  if (event) {
    if (!event.drawDefinitions) {
      return { error: 'No drawDefinitions in event' };
    }

    event.drawDefinitions = event.drawDefinitions.filter(drawDefinition => !drawIds.includes(drawDefinition.drawId));
  }
  
  return SUCCESS;
}

