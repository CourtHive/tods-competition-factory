import { findEvent } from '../../getters/eventGetter';
import { SUCCESS } from '../../../constants/resultConstants';

export function deleteDrawDefinitions({ tournamentRecord, eventId, drawIds }) {
  const drawId = Array.isArray(drawIds) && drawIds[0];
  const { event } = findEvent({ tournamentRecord, eventId, drawId });

  if (event) {
    if (!event.drawDefinitions) {
      return { error: 'No drawDefinitions in event' };
    }

    event.drawDefinitions = event.drawDefinitions.filter(
      drawDefinition => !drawIds.includes(drawDefinition.drawId)
    );
  }

  return SUCCESS;
}
