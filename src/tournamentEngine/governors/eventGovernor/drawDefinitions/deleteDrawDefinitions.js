import { addExtension } from '../../../../global/functions/producers/addExtension';
import { findExtension } from '../../../../global/functions/deducers/findExtension';
import { checkSchedulingProfile } from '../../scheduleGovernor/schedulingProfile';
import { addEventExtension } from '../../tournamentGovernor/addRemoveExtensions';
import { getDrawStructures } from '../../../../drawEngine/getters/findStructure';
import { getPositionAssignments } from '../../../getters/getPositionAssignments';
import { addEventTimeItem } from '../../tournamentGovernor/addTimeItem';
import { getFlightProfile } from '../../../getters/getFlightProfile';
import { definedAttributes } from '../../../../utilities/objects';
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
import {
  MAIN,
  QUALIFYING,
} from '../../../../constants/drawDefinitionConstants';
import { SUCCESS } from '../../../../constants/resultConstants';
import { AUDIT } from '../../../../constants/topicConstants';
import {
  DRAW_DEFINITION_NOT_FOUND,
  MISSING_TOURNAMENT_RECORD,
} from '../../../../constants/errorConditionConstants';
import {
  DRAW_DELETIONS,
  FLIGHT_PROFILE,
} from '../../../../constants/extensionConstants';
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
  event,
}) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };

  const drawId = Array.isArray(drawIds) && drawIds[0];

  if (!event) {
    const result = findEvent({ tournamentRecord, eventId, drawId });
    if (result.error) return result;
  }

  const auditTrail = [];
  const matchUpIds = [];
  const deletedDrawsDetail = [];

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
      const { drawId, drawType, drawName } = drawDefinition;
      const flight = flightProfile?.flights?.find(
        (flight) => flight.drawId === drawDefinition.drawId
      );

      if (flight) {
        flight.drawEntries = flight.drawEntries?.filter((entry) =>
          STRUCTURE_ENTERED_TYPES.includes(entry.entryStatus)
        );
      }

      const mainStructure = getDrawStructures({
        stageSequence: 1,
        drawDefinition,
        stage: MAIN,
      })?.structures?.[0];

      const positionAssignments =
        mainStructure &&
        getPositionAssignments({
          structureId: mainStructure.structureId,
          tournamentRecord,
          drawDefinition,
        })?.positionAssignments;

      const qualifyingStructures = getDrawStructures({
        stage: QUALIFYING,
        drawDefinition,
      })?.structures;

      const qualifyingPositionAssignments = qualifyingStructures?.length
        ? qualifyingStructures.map((qualifyingStructure) => {
            const stageSequence = qualifyingStructure.stageSequence;
            const positionAssignments = getPositionAssignments({
              structureId: qualifyingStructure.structureId,
              tournamentRecord,
              drawDefinition,
            })?.positionAssignments;
            return { positionAssignments, stageSequence };
          })
        : undefined;

      const audit = {
        action: DELETE_DRAW_DEFINITIONS,
        payload: {
          drawDefinitions: [drawDefinition],
          eventId: event.eventId,
          auditData,
        },
      };
      auditTrail.push(audit);
      deletedDrawsDetail.push(
        definedAttributes({
          tournamentId: tournamentRecord.tournamentId,
          qualifyingPositionAssignments,
          eventId: event.eventId,
          positionAssignments,
          auditData,
          drawType,
          drawName,
          drawId,
        })
      );
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

  addDrawDeletionTelemetry({ event, deletedDrawsDetail, auditData });

  return { ...SUCCESS };
}

function addDrawDeletionTelemetry({ event, deletedDrawsDetail, auditData }) {
  const { extension } = findExtension({
    name: DRAW_DELETIONS,
    element: event,
  });

  const deletionData = { ...auditData, deletedDrawsDetail };
  const updatedExtension = {
    name: DRAW_DELETIONS,
    value: Array.isArray(extension?.value)
      ? extension.value.concat(deletionData)
      : [deletionData],
  };
  addExtension({ element: event, extension: updatedExtension });
}
