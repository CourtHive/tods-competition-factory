import { findEvent } from '../../getters/eventGetter';
import { SUCCESS } from '../../../constants/resultConstants';

export function addDrawDefinition({tournamentRecord, eventId, drawDefinition}) {
  let { event } = findEvent({tournamentRecord, eventId});

  if (event) {
    if (!event.drawDefinitions) event.drawDefinitions = [];
    const drawDefinitionExists = event.drawDefinitions.reduce((exists, candidate) => {
      return candidate.drawId === drawDefinition.drawId ? true : exists;
    }, undefined);

    if (drawDefinitionExists) {
      return { error: 'drawId exists' };
    } else {
      event.drawDefinitions.push(drawDefinition);
    }
  }
  return SUCCESS;
}
