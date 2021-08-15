import { checkSchedulingProfile } from '../../scheduleGovernor/schedulingProfile';
import { addEventTimeItem } from '../../tournamentGovernor/addTimeItem';
import { allDrawMatchUps } from '../../../getters/matchUpsGetter';
import { getTimeItem } from '../../queryGovernor/timeItems';
import { addNotice } from '../../../../global/globalState';
import { findEvent } from '../../../getters/eventGetter';
import {
  deleteDrawNotice,
  deleteMatchUpsNotice,
} from '../../../../drawEngine/notifications/drawNotifications';

import { DELETE_DRAW_DEFINITIONS } from '../../../../constants/auditConstants';
import { SUCCESS } from '../../../../constants/resultConstants';
import { AUDIT } from '../../../../constants/topicConstants';
import {
  DRAW_DEFINITION_NOT_FOUND,
  MISSING_TOURNAMENT_RECORD,
} from '../../../../constants/errorConditionConstants';
import {
  HIDDEN,
  PUBLIC,
  PUBLISH,
  STATUS,
} from '../../../../constants/timeItemConstants';

export function deleteDrawDefinitions({
  tournamentRecord,
  eventId,
  drawIds,
  auditData,
}) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  const drawId = Array.isArray(drawIds) && drawIds[0];
  const { event } = findEvent({ tournamentRecord, eventId, drawId });
  const auditTrail = [];
  const matchUpIds = [];
  const deletedDrawDetails = [];

  if (event) {
    if (!event.drawDefinitions) {
      return { error: DRAW_DEFINITION_NOT_FOUND };
    }

    event.drawDefinitions = event.drawDefinitions.filter((drawDefinition) => {
      if (drawIds.includes(drawDefinition.drawId)) {
        const audit = {
          action: DELETE_DRAW_DEFINITIONS,
          payload: {
            drawDefinitions: [drawDefinition],
            eventId: event.eventId,
            auditData,
          },
        };
        auditTrail.push(audit);
        const { drawId, drawType, drawName } = drawDefinition;
        deletedDrawDetails.push({
          auditData,
          drawId,
          drawType,
          drawName,
          eventId: event.eventId,
        });
        const { matchUps } = allDrawMatchUps({ event, drawDefinition });
        matchUps.forEach(({ matchUpId }) => matchUpIds.push(matchUpId));
      }
      return !drawIds.includes(drawDefinition.drawId);
    });

    // cleanup references to drawId in schedulingProfile extension
    checkSchedulingProfile({ tournamentRecord });

    const itemType = `${PUBLISH}.${STATUS}`;
    const publishStatus = getTimeItem({ event, itemType });
    const drawPublished =
      publishStatus && publishStatus.drawIds?.includes(drawId);
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

  if (auditTrail.length) {
    addNotice({ topic: AUDIT, payload: auditTrail });
    const timeItem = {
      itemType: DELETE_DRAW_DEFINITIONS,
      itemValue: deletedDrawDetails,
    };
    const result = addEventTimeItem({ event, timeItem });
    if (result.error) return { error: result.error };
  }
  if (matchUpIds.length) {
    deleteMatchUpsNotice({ matchUpIds });
  }
  deleteDrawNotice({ drawId });

  return SUCCESS;
}
