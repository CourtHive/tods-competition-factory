import { getAllStructureMatchUps } from '../../../drawEngine/getters/getMatchUps/getAllStructureMatchUps';
import { decorateResult } from '../../../global/functions/decorateResult';
import { instanceCount, intersection } from '../../../utilities';
import { copyTieFormat } from './copyTieFormat';
import { getTieFormat } from './getTieFormat';
import { validUpdate } from './validUpdate';
import {
  modifyDrawNotice,
  modifyMatchUpNotice,
} from '../../../drawEngine/notifications/drawNotifications';

import { SUCCESS } from '../../../constants/resultConstants';
import { TEAM } from '../../../constants/matchUpTypes';
import {
  CANNOT_MODIFY_TIEFORMAT,
  INVALID_MATCHUP,
  INVALID_TIE_FORMAT,
  MISSING_DRAW_DEFINITION,
  MISSING_TIE_FORMAT,
} from '../../../constants/errorConditionConstants';

// used to determine that all collectionIds have the same matchUpsCount
function mapsCheck(map1, map2) {
  const referenceKeys = Object.keys(map1);
  return (
    intersection(referenceKeys, Object.keys(map2)).length ===
    referenceKeys.length
  );
}

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
  let modifiedCount = 0;
  let modifiedStructuresCount = 0;

  const collectionMap = tieFormat?.collectionDefinitions.reduce(
    (instanceMap, def) => {
      instanceMap[def.collectionId] =
        (instanceMap[def.collectionId] || 0) + def.matchUpCount;
      return instanceMap;
    },
    {}
  );

  const matchingCollections = ({ tieFormat }) => {
    const cMap = tieFormat?.collectionDefinitions.reduce((instanceMap, def) => {
      instanceMap[def.collectionId] =
        (instanceMap[def.collectionId] || 0) + def.matchUpCount;
      return instanceMap;
    }, {});
    return mapsCheck(collectionMap, cMap);
  };

  const { drawDefaultTieFormat, eventDefaultTieFormat } = getTieFormat({
    drawDefinition,
    event,
  });

  if (event && eventId) {
    for (const drawDefinition of event.drawDefinitions || []) {
      processDrawDefinition({ drawDefinition });
    }
    event.tieFormat = tieFormat;
    modifiedCount += 1;
  } else if (matchUp) {
    if (!matchUp.tieMatchUps) {
      return decorateResult({ result: { error: INVALID_MATCHUP }, stack });
    }
    // ensure that all tieMatchUps are referenced by tieFormat
    const matchUpMap = instanceCount(
      matchUp.tieMatchUps?.map(({ collectionId }) => collectionId)
    );
    if (mapsCheck(collectionMap, matchUpMap)) {
      if (validUpdate({ matchUp, updateInProgressMatchUps })) {
        matchUp.tieFormat = tieFormat;
        modifiedCount += 1;
      } else {
        return decorateResult({
          result: { error: CANNOT_MODIFY_TIEFORMAT },
          info: 'matchUp is IN_PROGRESS or COMPLETE',
        });
      }
    } else {
      return decorateResult({
        context: { collectionMap, matchUpMap },
        result: { error: INVALID_TIE_FORMAT },
        info: 'on matchUp',
        stack,
      });
    }
    modifyMatchUpNotice({
      tournamentId: tournamentRecord?.tournamentId,
      eventId: event?.eventId,
      drawDefinition,
      matchUp,
    });
  } else if (structure) {
    // all TEAM matchUps within the structure have tieMatchUps which were created following a tieFormat which occurs higher in the hierarchy
    // attaching a tieFormat to the structure must ensure that affected TEAM matchUps within the structure all have appropriate tieMatchUps
    // therefore those that fail to match the modified tieFormat MUST have an appropriate tieFormat attached from higher in the hierarchy
    const inheritedTieFormat = drawDefaultTieFormat || eventDefaultTieFormat;
    const modified = processStructure({ inheritedTieFormat, structure });
    modifiedStructuresCount += modified;

    structure.tieFormat = tieFormat;
    modifiedCount += 1;
    modifyDrawNotice({
      structureIds: [structure.structureId],
      eventId: event?.eventId,
      drawDefinition,
    });
  } else if (drawDefinition) {
    processDrawDefinition({ drawDefinition });
    drawDefinition.tieFormat = tieFormat;
    modifiedCount += 1;
  } else {
    return { error: MISSING_DRAW_DEFINITION };
  }

  return { ...SUCCESS, modifiedCount, modifiedStructuresCount, tieFormat };

  function processDrawDefinition({ drawDefinition }) {
    const modifiedStructureIds = [];
    for (const structure of drawDefinition.structures || []) {
      // if a sub-structure has a tieFormat then setting drawDefinition.tieFormat will have no effect
      if (structure.tieFormat) continue;
      const inheritedTieFormat = eventDefaultTieFormat;
      const modifiedCount = processStructure({ inheritedTieFormat, structure });
      if (modifiedCount) {
        modifiedStructuresCount += modifiedCount;
        modifiedStructureIds.push(structure.structureId);
      }
    }

    modifyDrawNotice({
      structureIds: modifiedStructureIds,
      eventId: event?.eventId,
      drawDefinition,
    });

    return modifiedStructureIds.length;
  }

  function processStructure({ inheritedTieFormat, structure }) {
    let modifiedCount = 0;
    const structureMatchUps =
      getAllStructureMatchUps({
        matchUpFilters: { matchUpTypes: [TEAM] },
        structure,
      })?.matchUps || [];

    for (const matchUp of structureMatchUps) {
      let modified = false;
      const tieMatchUpsMap = instanceCount(
        matchUp.tieMatchUps?.map(({ collectionId }) => collectionId)
      );
      if (!mapsCheck(collectionMap, tieMatchUpsMap)) {
        if (inheritedTieFormat) {
          matchUp.tieFormat = inheritedTieFormat;
          modified = true;
        } else {
          return decorateResult({
            result: { error: MISSING_TIE_FORMAT },
            stack,
          });
        }
      } else if (
        matchUp.tieFormat &&
        matchingCollections(matchUp) &&
        validUpdate({ matchUp, updateInProgressMatchUps })
      ) {
        matchUp.tieFormat = copyTieFormat(tieFormat);
        modified = true;
      }
      if (modified) {
        modifiedCount += 1;
        modifyMatchUpNotice({
          tournamentId: tournamentRecord?.tournamentId,
          drawDefinition,
          eventId,
          matchUp,
        });
      }
    }
    return modifiedCount;
  }
}
