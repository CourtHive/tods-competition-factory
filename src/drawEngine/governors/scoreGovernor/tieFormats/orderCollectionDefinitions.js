import { getAllStructureMatchUps } from '../../../getters/getMatchUps/getAllStructureMatchUps';
import { findMatchUp } from '../../../getters/getMatchUps/findMatchUp';
import { findStructure } from '../../../getters/findStructure';
import { makeDeepCopy } from '../../../../utilities';
import {
  modifyDrawNotice,
  modifyMatchUpNotice,
} from '../../../notifications/drawNotifications';

import { SUCCESS } from '../../../../constants/resultConstants';
import { TEAM } from '../../../../constants/matchUpTypes';
import {
  INVALID_VALUES,
  NOT_FOUND,
} from '../../../../constants/errorConditionConstants';

function copyTieFormat(tieFormat) {
  return makeDeepCopy(tieFormat, false, true);
}

function getOrderedTieFormat({ tieFormat, orderMap }) {
  const orderedTieFormat = copyTieFormat(tieFormat);
  tieFormat.collectionDefinitions.forEach((collectionDefinition) => {
    const collectionOrder = orderMap[collectionDefinition.collectionId];
    if (collectionOrder) collectionDefinition.collectionOrder = collectionOrder;
  });

  tieFormat.collectionDefinitions.sort(
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
    event.tieFormat = getOrderedTieFormat({
      tieFormat: event.tieFormat,
      orderMap,
    });
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
        tournamentRecord,
        drawDefinition,
        structure,
        orderMap,
      });
      modifyDrawNotice({
        drawDefinition,
        structureIds: [structure.structureId],
      });
    }
  } else if (drawDefinition?.tieFormat) {
    drawDefinition.tieFormat = getOrderedTieFormat({
      tieFormat: drawDefinition.tieFormat,
      orderMap,
    });
    const modifiedStructureIds = [];

    for (const structure of drawDefinition.structures || []) {
      if (structure.tieFormat)
        structure.tieFormat = getOrderedTieFormat({
          tieFormat: structure.tieFormat,
          orderMap,
        });
      updateStructureMatchUps({
        tournamentRecord,
        drawDefinition,
        structure,
        orderMap,
      });
      modifiedStructureIds.push(structure.structureId);
    }
    modifyDrawNotice({ drawDefinition, structureIds: modifiedStructureIds });
  } else {
    return { error: NOT_FOUND };
  }

  return { ...SUCCESS };
}

function updateStructureMatchUps({
  tournamentRecord,
  drawDefinition,
  structure,
  orderMap,
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
        matchUp,
      });
    }
  }
}
