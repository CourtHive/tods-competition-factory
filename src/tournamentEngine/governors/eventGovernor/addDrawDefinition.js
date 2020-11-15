import { findEvent } from '../../getters/eventGetter';
import { SUCCESS } from '../../../constants/resultConstants';
import { DRAW_ID_EXISTS } from '../../../constants/errorConditionConstants';

export function addDrawDefinition({
  tournamentRecord,
  eventId,
  drawDefinition,
}) {
  const { event } = findEvent({ tournamentRecord, eventId });

  if (event) {
    if (!event.drawDefinitions) event.drawDefinitions = [];
    const drawDefinitionExists = event.drawDefinitions.reduce(
      (exists, candidate) => {
        return candidate.drawId === drawDefinition.drawId ? true : exists;
      },
      undefined
    );

    if (drawDefinitionExists) {
      return { error: DRAW_ID_EXISTS };
    } else {
      event.drawDefinitions.push(drawDefinition);
    }
  }
  return SUCCESS;
}
