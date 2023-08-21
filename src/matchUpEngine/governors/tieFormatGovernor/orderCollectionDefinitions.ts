import { getAllStructureMatchUps } from '../../../drawEngine/getters/getMatchUps/getAllStructureMatchUps';
import { findMatchUp } from '../../../drawEngine/getters/getMatchUps/findMatchUp';
import { findStructure } from '../../../drawEngine/getters/findStructure';
import { copyTieFormat } from './copyTieFormat';
import {
  modifyDrawNotice,
  modifyMatchUpNotice,
} from '../../../drawEngine/notifications/drawNotifications';

import { SUCCESS } from '../../../constants/resultConstants';
import { TEAM } from '../../../constants/matchUpTypes';
import {
  INVALID_VALUES,
  MISSING_MATCHUP,
  NOT_FOUND,
} from '../../../constants/errorConditionConstants';
import {
  DrawDefinition,
  Event,
  MatchUp,
  Tournament,
} from '../../../types/tournamentFromSchema';

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

type OrderCollectionDefinitionsArgs = {
  tournamentRecord: Tournament;
  drawDefinition: DrawDefinition;
  structureId?: string;
  matchUpId?: string;
  matchUp?: MatchUp;
  eventId?: string;
  orderMap: any;
  event?: Event;
};

export function orderCollectionDefinitions({
  tournamentRecord,
  drawDefinition,
  structureId,
  matchUpId,
  orderMap,
  eventId,
  matchUp,
  event,
}: OrderCollectionDefinitionsArgs) {
  if (typeof orderMap !== 'object') return { error: INVALID_VALUES, orderMap };

  if (eventId && event?.tieFormat) {
    updateEventTieFormat({ tournamentRecord, event, orderMap });
  } else if (matchUpId) {
    const result =
      drawDefinition &&
      findMatchUp({
        drawDefinition,
        matchUpId,
      });

    if (result?.error) return result;

    matchUp = result.matchUp;
    if (!matchUp) return { error: MISSING_MATCHUP };

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
    const result = findStructure({ drawDefinition, structureId });
    if (result.error) return result;
    const structure = result.structure;

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

type UpdateEventTieFormatArgs = {
  tournamentRecord: Tournament;
  structureIds?: string[];
  orderMap?: any;
  event: Event;
};

function updateEventTieFormat({
  tournamentRecord,
  structureIds, // allow scoping to only specific structureIds
  orderMap,
  event,
}: UpdateEventTieFormatArgs) {
  const updatedFormat = getOrderedTieFormat({
    tieFormat: event.tieFormat,
    orderMap,
  });
  if (!structureIds?.length) event.tieFormat = updatedFormat;

  for (const drawDefinition of event.drawDefinitions ?? []) {
    updateDrawTieFormat({
      tournamentRecord,
      drawDefinition,
      structureIds,
      orderMap,
      event,
    });
  }
}

type UpdateDrawTieFormatArgs = {
  tournamentRecord: Tournament;
  drawDefinition: DrawDefinition;
  structureIds?: string[];
  orderMap?: any;
  event?: Event;
};

function updateDrawTieFormat({
  tournamentRecord,
  drawDefinition,
  structureIds,
  orderMap,
  event,
}: UpdateDrawTieFormatArgs) {
  const tieFormat = drawDefinition.tieFormat ?? event?.tieFormat;
  const updatedFormat = getOrderedTieFormat({
    tieFormat,
    orderMap,
  });
  if (!structureIds?.length) drawDefinition.tieFormat = updatedFormat;
  const modifiedStructureIds: string[] = [];

  for (const structure of drawDefinition.structures ?? []) {
    // if structureIds is present, only modify referenced structures
    if (structureIds?.length && !structureIds.includes(structure.structureId))
      continue;

    if (structure.tieFormat || structureIds?.includes(structure.structureId))
      structure.tieFormat = getOrderedTieFormat({
        tieFormat:
          structure.tieFormat ?? drawDefinition.tieFormat ?? event?.tieFormat,
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
