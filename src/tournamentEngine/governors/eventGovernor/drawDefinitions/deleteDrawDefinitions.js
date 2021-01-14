import { findEvent } from '../../../getters/eventGetter';
import { getTimeItem } from '../../queryGovernor/timeItems';
import { addEventTimeItem } from '../../tournamentGovernor/addTimeItem';

import { SUCCESS } from '../../../../constants/resultConstants';
import { DRAW_DEFINITION_NOT_FOUND } from '../../../../constants/errorConditionConstants';
import {
  HIDDEN,
  PUBLIC,
  PUBLISH,
  STATUS,
} from '../../../../constants/timeItemConstants';

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

    const itemType = `${PUBLISH}.${STATUS}`;
    const publishStatus = getTimeItem({ event, itemType });
    const drawPublished =
      publishStatus &&
      (!publishStatus.drawIds?.length ||
        publishStatus.drawIds.includes(drawId)) &&
      publishStatus !== HIDDEN;
    if (drawPublished) {
      const updatedDrawIds =
        publishStatus.drawIds?.filter(
          (publishedDrawId) => publishedDrawId !== drawId
        ) || [];
      const timeItem = {
        itemType: `${PUBLISH}.${STATUS}`,
        itemValue: {
          [PUBLIC]: {
            drawIds: updatedDrawIds,
          },
        },
      };
      const result = addEventTimeItem({ event, timeItem });
      if (result.error) return { error: result.error };
    }
  }

  return SUCCESS;
}
