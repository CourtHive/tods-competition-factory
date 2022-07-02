import { getAllStructureMatchUps } from '../../../../drawEngine/getters/getMatchUps/getAllStructureMatchUps';
import { findMatchUp } from '../../../../drawEngine/getters/getMatchUps/findMatchUp';
import { findStructure } from '../../../../drawEngine/getters/findStructure';
import { copyTieFormat } from './copyTieFormat';
import {
  modifyDrawNotice,
  modifyMatchUpNotice,
} from '../../../../drawEngine/notifications/drawNotifications';

import { SUCCESS } from '../../../../constants/resultConstants';
import { TEAM } from '../../../../constants/matchUpTypes';
import {
  INVALID_VALUES,
  NOT_FOUND,
} from '../../../../constants/errorConditionConstants';

function getOrderedTieFormat({ tieFormat, orderMap }) {
  const orderedTieFormat = copyTieFormat(tieFormat);
  orderedTieFormat.collectionDefinitions.forEach((collectionDefinition) => {
    const collectionOrder = orderMap[collectionDefinition.collectionId];
    if (collectionOrder) collectionDefinition.collectionOrder = collectionOrder;
  });

  orderedTieFormat.collectionDefinitions.sort(
    (a, b) => a.collectionOrder - b.collectionOrder
  );

  return orderedTieFormat;
}

export function orderCollectionDefinitions({
  tournamentRecord,
  drawDefinition,
  structureId,
  matchUpId,
  orderMap,
  eventId,
  event,
}) {
  if (typeof orderMap !== 'object') return { error: INVALID_VALUES, orderMap };

  if (eventId && event?.tieFormat) {
    updateEventTieFormat({ tournamentRecord, event, orderMap });
  } else if (matchUpId) {
    const { matchUp, error } = findMatchUp({
      drawDefinition,
      matchUpId,
    });
    if (error) return { error };

    if (matchUp?.tieFormat) {
      matchUp.tieFormat = getOrderedTieFormat({
        tieFormat: matchUp.tieFormat,
        orderMap,
      });
      modifyMatchUpNotice({
        tournamentId: tournamentRecord?.tournamentId,
        eventId: event?.eventId,
        drawDefinition,
        matchUp,
      });
    }
  } else if (structureId) {
    const { error, structure } = findStructure({ drawDefinition, structureId });
    if (error) return { error };

    if (structure?.tieFormat) {
      structure.tieFormat = getOrderedTieFormat({
        tieFormat: structure.tieFormat,
        orderMap,
      });
      updateStructureMatchUps({
        eventId: event?.eventId,
        tournamentRecord,
        drawDefinition,
        structure,
        orderMap,
      });
      modifyDrawNotice({
        drawDefinition,
        structureIds: [structure.structureId],
      });
    } else if (drawDefinition.tieFormat) {
      updateDrawTieFormat({
        structureIds: [structureId],
        tournamentRecord,
        drawDefinition,
        orderMap,
        event,
      });
    } else if (event?.tieFormat) {
      updateEventTieFormat({
        structureIds: [structureId],
        tournamentRecord,
        orderMap,
        event,
      });
    } else {
      return { error: NOT_FOUND };
    }
  } else if (drawDefinition?.tieFormat) {
    updateDrawTieFormat({ tournamentRecord, drawDefinition, orderMap, event });
  } else {
    return { error: NOT_FOUND };
  }

  return { ...SUCCESS };
}

function updateEventTieFormat({
  tournamentRecord,
  structureIds, // allow scoping to only specific structureIds
  orderMap,
  event,
}) {
  const updatedFormat = getOrderedTieFormat({
    tieFormat: event.tieFormat,
    orderMap,
  });
  if (!structureIds?.length) event.tieFormat = updatedFormat;

  for (const drawDefinition of event.drawDefinitions || []) {
    updateDrawTieFormat({
      tournamentRecord,
      drawDefinition,
      structureIds,
      orderMap,
      event,
    });
  }
}

function updateDrawTieFormat({
  tournamentRecord,
  drawDefinition,
  structureIds,
  orderMap,
  event,
}) {
  const tieFormat = drawDefinition.tieFormat || event.tieFormat;
  const updatedFormat = getOrderedTieFormat({
    tieFormat,
    orderMap,
  });
  if (!structureIds?.length) drawDefinition.tieFormat = updatedFormat;
  const modifiedStructureIds = [];

  for (const structure of drawDefinition.structures || []) {
    // if structureIds is present, only modify referenced structures
    if (structureIds?.length && !structureIds.includes(structure.structureId))
      continue;

    if (structure.tieFormat || structureIds?.includes(structure.structureId))
      structure.tieFormat = getOrderedTieFormat({
        tieFormat:
          structure.tieFormat || drawDefinition.tieFormat || event.tieFormat,
        orderMap,
      });
    updateStructureMatchUps({
      eventId: event?.eventId,
      tournamentRecord,
      drawDefinition,
      structure,
      orderMap,
    });
    modifiedStructureIds.push(structure.structureId);
  }
  modifyDrawNotice({ drawDefinition, structureIds: modifiedStructureIds });
}

function updateStructureMatchUps({
  tournamentRecord,
  drawDefinition,
  structure,
  orderMap,
  eventId,
}) {
  const matchUps = getAllStructureMatchUps({
    matchUpFilters: { matchUpTypes: [TEAM] },
    structure,
  })?.matchUps;

  for (const matchUp of matchUps) {
    if (matchUp.tieFormat) {
      matchUp.tieFormat = getOrderedTieFormat({
        tieFormat: matchUp.tieFormat,
        orderMap,
      });
      modifyMatchUpNotice({
        tournamentId: tournamentRecord?.tournamentId,
        drawDefinition,
        eventId,
        matchUp,
      });
    }
  }
}
