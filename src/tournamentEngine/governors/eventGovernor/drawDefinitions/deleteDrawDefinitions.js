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
import { addNotice } from '../../../../global/globalState';
import { allDrawMatchUps } from '../../../getters/matchUpsGetter';

export function deleteDrawDefinitions({ tournamentRecord, eventId, drawIds }) {
  const drawId = Array.isArray(drawIds) && drawIds[0];
  const { event } = findEvent({ tournamentRecord, eventId, drawId });
  const auditTrail = [];
  const matchUpIds = [];

  if (event) {
    if (!event.drawDefinitions) {
      return { error: DRAW_DEFINITION_NOT_FOUND };
    }

    event.drawDefinitions = event.drawDefinitions.filter((drawDefinition) => {
      if (drawIds.includes(drawDefinition.drawId)) {
        const auditData = {
          action: 'deleteDrawDefinitions',
          deletedDrawDefinition: drawDefinition,
        };
        auditTrail.push(auditData);
        const { matchUps } = allDrawMatchUps({ drawDefinition });
        matchUps.forEach(({ matchUpId }) => matchUpIds.push(matchUpId));
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

  if (auditTrail.length) addNotice({ topic: 'audit', payload: auditTrail });
  if (matchUpIds.length)
    addNotice({ topic: 'deletedMatchUpIds', payload: { matchUpIds } });
  return SUCCESS;
}
