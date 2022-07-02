import { getAllStructureMatchUps } from '../../../../drawEngine/getters/getMatchUps/getAllStructureMatchUps';
import { allEventMatchUps } from '../../../../tournamentEngine/getters/matchUpsGetter';
import { getAllDrawMatchUps } from '../../../../drawEngine/getters/getMatchUps/drawMatchUps';
import { decorateResult } from '../../../../global/functions/decorateResult';
import { instanceCount, intersection } from '../../../../utilities';
import { copyTieFormat } from './copyTieFormat';
import { validUpdate } from './validUpdate';
import {
  modifyDrawNotice,
  modifyMatchUpNotice,
} from '../../../../drawEngine/notifications/drawNotifications';

import { DOUBLES, SINGLES, TEAM } from '../../../../constants/matchUpTypes';
import { SUCCESS } from '../../../../constants/resultConstants';
import {
  INVALID_TIE_FORMAT,
  MISSING_DRAW_DEFINITION,
} from '../../../../constants/errorConditionConstants';

function updateCollectionDefinitions(element, tieFormat) {
  element.tieFormat = tieFormat;
}

function mapsCheck(map1, map2) {
  const referenceKeys = Object.keys(map1);
  return (
    intersection(referenceKeys, Object.keys(map2)).length ===
    referenceKeys.length
  );
}

// only allows update to collectionName and matchUpFormat
export function updateTieFormat({
  updateInProgressMatchUps,
  tournamentRecord,
  drawDefinition,
  structure,
  tieFormat,
  eventId,
  matchUp,
  event,
}) {
  const stack = 'updateTieFormat';

  const collectionMap = tieFormat?.collectionDefinitions.reduce(
    (instanceMap, def) => {
      instanceMap[def.collectionId] =
        (instanceMap[def.collectionId] || 0) + def.matchUpCount;
      return instanceMap;
    },
    {}
  );

  if (event && eventId) {
    if (event.tieFormat) {
      updateCollectionDefinitions(event, tieFormat);
    } else {
      // ensure that all matchUps in the event contain tieMatchUps referenced by tieFormat
      const { matchUps } = allEventMatchUps({
        matchUpFilters: { matchUpTypes: [SINGLES, DOUBLES] },
        structure,
      });
      const matchUpMap = instanceCount(
        matchUps.map(({ collectionId }) => collectionId)
      );
      if (mapsCheck(collectionMap, matchUpMap)) {
        event.tieFormat = copyTieFormat(tieFormat);
      } else {
        return decorateResult({
          context: { collectionMap, matchUpMap },
          result: { error: INVALID_TIE_FORMAT },
          info: 'on event',
          stack,
        });
      }
    }
  } else if (matchUp) {
    if (matchUp.tieFormat) {
      updateCollectionDefinitions(matchUp, tieFormat);
    } else {
      // ensure that all tieMatchUps are referenced by tieFormat
      const matchUpMap = instanceCount(
        matchUp.tieMatchUps.map(({ collectionId }) => collectionId)
      );
      if (mapsCheck(collectionMap, matchUpMap)) {
        matchUp.tieFormat = copyTieFormat(tieFormat);
      } else {
        return decorateResult({
          context: { collectionMap, matchUpMap },
          result: { error: INVALID_TIE_FORMAT },
          info: 'on matchUp',
          stack,
        });
      }
    }
    modifyMatchUpNotice({
      tournamentId: tournamentRecord?.tournamentId,
      eventId: event?.eventId,
      drawDefinition,
      matchUp,
    });
  } else if (structure) {
    if (structure.tieFormat) {
      updateCollectionDefinitions(structure, tieFormat);
    } else {
      // ensure that all matchUps in the structure contain tieMatchUps referenced by tieFormat
      const { matchUps } = getAllStructureMatchUps({
        matchUpFilters: { matchUpTypes: [SINGLES, DOUBLES] },
        structure,
      });
      const matchUpMap = instanceCount(
        matchUps.map(({ collectionId }) => collectionId)
      );
      if (mapsCheck(collectionMap, matchUpMap)) {
        structure.tieFormat = copyTieFormat(tieFormat);
      } else {
        return decorateResult({
          context: { collectionMap, matchUpMap },
          result: { error: INVALID_TIE_FORMAT },
          info: 'on structure',
          stack,
        });
      }
    }
    updateStructureMatchUps({
      updateInProgressMatchUps,
      eventId: event?.eventId,
      tournamentRecord,
      drawDefinition,
      structure,
      tieFormat,
    });
    modifyDrawNotice({
      structureIds: [structure.structureId],
      eventId: event?.eventId,
      drawDefinition,
    });
  } else if (drawDefinition) {
    if (drawDefinition.tieFormat) {
      updateCollectionDefinitions(drawDefinition, tieFormat);
    } else {
      // ensure that all matchUps in the draw contain tieMatchUps referenced by tieFormat
      const { matchUps } = getAllDrawMatchUps({
        matchUpFilters: { matchUpTypes: [SINGLES, DOUBLES] },
        drawDefinition,
      });
      const matchUpMap = instanceCount(
        matchUps.map(({ collectionId }) => collectionId)
      );
      if (mapsCheck(collectionMap, matchUpMap)) {
        drawDefinition.tieFormat = copyTieFormat(tieFormat);
      }
    }
    const modifiedStructureIds = [];

    for (const structure of drawDefinition.structures || []) {
      updateStructureMatchUps({
        updateInProgressMatchUps,
        eventId: event?.eventId,
        tournamentRecord,
        drawDefinition,
        structure,
        tieFormat,
      });
      modifiedStructureIds.push(structure.structureId);
    }
    modifyDrawNotice({
      structureIds: modifiedStructureIds,
      eventId: event?.eventId,
      drawDefinition,
    });
  } else {
    return { error: MISSING_DRAW_DEFINITION };
  }

  return { ...SUCCESS };
}

function updateStructureMatchUps({
  updateInProgressMatchUps,
  tournamentRecord,
  drawDefinition,
  structure,
  tieFormat,
  eventId,
}) {
  const matchUps = getAllStructureMatchUps({
    matchUpFilters: { matchUpTypes: [TEAM] },
    structure,
  })?.matchUps;

  // all team matchUps in the structure which are not completed and which have no score value should have matchUps added
  const targetMatchUps = matchUps.filter(
    (matchUp) =>
      validUpdate({ matchUp, updateInProgressMatchUps }) && matchUp.tieFormat
  );

  for (const matchUp of targetMatchUps) {
    if (matchUp.tieFormat?.collectionDefinitions) {
      updateCollectionDefinitions(matchUp, tieFormat);
      modifyMatchUpNotice({
        tournamentId: tournamentRecord?.tournamentId,
        drawDefinition,
        eventId,
        matchUp,
      });
    }
  }
}
