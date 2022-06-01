import { checkSchedulingProfile } from '../../scheduleGovernor/schedulingProfile';
import { addEventExtension } from '../../tournamentGovernor/addRemoveExtensions';
import { addEventTimeItem } from '../../tournamentGovernor/addTimeItem';
import { getFlightProfile } from '../../../getters/getFlightProfile';
import { allDrawMatchUps } from '../../../getters/matchUpsGetter';
import { addNotice } from '../../../../global/state/globalState';
import { getTimeItem } from '../../queryGovernor/timeItems';
import { findEvent } from '../../../getters/eventGetter';
import {
  deleteDrawNotice,
  deleteMatchUpsNotice,
} from '../../../../drawEngine/notifications/drawNotifications';

import { STRUCTURE_ENTERED_TYPES } from '../../../../constants/entryStatusConstants';
import { DELETE_DRAW_DEFINITIONS } from '../../../../constants/auditConstants';
import { FLIGHT_PROFILE } from '../../../../constants/extensionConstants';
import { SUCCESS } from '../../../../constants/resultConstants';
import { AUDIT } from '../../../../constants/topicConstants';
import {
  DRAW_DEFINITION_NOT_FOUND,
  MISSING_TOURNAMENT_RECORD,
} from '../../../../constants/errorConditionConstants';
import {
  PUBLIC,
  PUBLISH,
  STATUS,
} from '../../../../constants/timeItemConstants';

export function deleteDrawDefinitions({
  tournamentRecord,
  drawIds = [],
  auditData,
  eventId,
}) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  const drawId = Array.isArray(drawIds) && drawIds[0];

  const { event, error } = findEvent({ tournamentRecord, eventId, drawId });
  if (error) return { error };

  const auditTrail = [];
  const matchUpIds = [];
  const deletedDrawDetails = [];

  if (!event.drawDefinitions) return { error: DRAW_DEFINITION_NOT_FOUND };

  const eventDrawIds = event.drawDefinitions.map(({ drawId }) => drawId);
  // if drawIds were not provided, assume that the intent is to delete all drawDefinitions
  if (!drawIds.length) drawIds = eventDrawIds;

  const drawDefinitionsExist =
    drawIds.length && drawIds.every((drawId) => eventDrawIds.includes(drawId));
  if (!drawDefinitionsExist) return { error: DRAW_DEFINITION_NOT_FOUND };

  const { flightProfile } = getFlightProfile({ event });
  event.drawDefinitions = event.drawDefinitions.filter((drawDefinition) => {
    if (drawIds.includes(drawDefinition.drawId)) {
      const flight = flightProfile?.flights?.find(
        (flight) => flight.drawId === drawDefinition.drawId
      );

      if (flight) {
        flight.drawEntries = flight.drawEntries?.filter((entry) =>
          STRUCTURE_ENTERED_TYPES.includes(entry.entryStatus)
        );
      }

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
        tournamentId: tournamentRecord.tournamentId,
        eventId: event.eventId,
        auditData,
        drawId,
        drawType,
        drawName,
      });
      const { matchUps } = allDrawMatchUps({ event, drawDefinition });
      matchUps.forEach(({ matchUpId }) => matchUpIds.push(matchUpId));
    }
    return !drawIds.includes(drawDefinition.drawId);
  });

  if (flightProfile) {
    const extension = {
      name: FLIGHT_PROFILE,
      value: flightProfile,
    };

    addEventExtension({ event, extension });
  }

  // cleanup references to drawId in schedulingProfile extension
  checkSchedulingProfile({ tournamentRecord });

  const itemType = `${PUBLISH}.${STATUS}`;
  const { timeItem } = getTimeItem({ element: event, itemType });
  const publishStatus = timeItem?.itemValue?.[PUBLIC];

  for (const drawId of drawIds) {
    const drawPublished = publishStatus?.drawIds?.includes(drawId);
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
    if (result.error) return result;
  }
  if (matchUpIds.length) {
    deleteMatchUpsNotice({
      tournamentId: tournamentRecord?.tournamentId,
      matchUpIds,
    });
  }

  drawIds.forEach((drawId) => {
    deleteDrawNotice({ drawId });
  });

  return { ...SUCCESS };
}
