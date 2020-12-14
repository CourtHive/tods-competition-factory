import { findEvent } from '../../getters/eventGetter';
import { SUCCESS } from '../../../constants/resultConstants';
import { DRAW_DEFINITION_NOT_FOUND } from '../../../constants/errorConditionConstants';

export function deleteDrawDefinitions({
  tournamentRecord,
  auditData = {}, // TODO: auditData can be picked off by Engines and ignored in methods
  auditEngine,
  eventId,
  drawIds,
}) {
  const drawId = Array.isArray(drawIds) && drawIds[0];
  const { event } = findEvent({ tournamentRecord, eventId, drawId });

  if (event) {
    if (!event.drawDefinitions) {
      return { error: DRAW_DEFINITION_NOT_FOUND };
    }

    event.drawDefinitions = event.drawDefinitions.filter((drawDefinition) => {
      if (drawIds.includes(drawDefinition.drawId)) {
        Object.assign(auditData, {
          action: 'deleteDrawDefinitions',
          deletedDrawDefinition: drawDefinition,
        });
        auditEngine.addAuditItem({ auditData });
      }
      return !drawIds.includes(drawDefinition.drawId);
    });
  }

  return SUCCESS;
}
