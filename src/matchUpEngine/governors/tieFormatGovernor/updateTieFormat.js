import { getAllStructureMatchUps } from '../../../drawEngine/getters/getMatchUps/getAllStructureMatchUps';
import { getTieFormat } from '../../../tournamentEngine/getters/getTieFormat';
import { decorateResult } from '../../../global/functions/decorateResult';
import { instanceCount, intersection, UUID } from '../../../utilities';
import { copyTieFormat } from './copyTieFormat';
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
  collectionId,
  structure,
  tieFormat,
  eventId,
  matchUp,
  event,
}) {
  const stack = 'updateTieFormat';
  let modifiedStructuresCount = 0;
  let modifiedCount = 0;

  const newCollectionId = UUID();
  // const newCollectionId = collectionId;

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
    tournamentRecord,
    drawDefinition,
    event,
  });

  const uniqueTieFormat = {
    ...tieFormat,
    collectionDefinitions: tieFormat.collectionDefinitions.map((def) => ({
      ...def,
      collectionId:
        def.collectionId === collectionId ? newCollectionId : def.collectionId,
    })),
  };

  if (event && eventId) {
    for (const drawDefinition of event.drawDefinitions || []) {
      processDrawDefinition({ drawDefinition });
    }
    event.tieFormat = uniqueTieFormat;
    // descend into every drawDefinition that does not have a tieFormat
    // descend into every structure that does not have a tieFormat
    // descend into every TEAM matchUp that does not have a tieFormat
    // ... where tieMatchUp.collectionId === collectionId, set tieMatchUp.collectionId = newCollectionId
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
        matchUp.tieFormat = uniqueTieFormat;
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

    updateTieMatchUps({ matchUp });
    modifyMatchUpNotice({
      tournamentId: tournamentRecord?.tournamentId,
      eventId: event?.eventId,
      context: stack,
      drawDefinition,
      matchUp,
    });
  } else if (structure) {
    // all TEAM matchUps within the structure have tieMatchUps which were created following a tieFormat which occurs higher in the hierarchy
    // attaching a tieFormat to the structure must ensure that affected TEAM matchUps within the structure all have appropriate tieMatchUps
    // therefore those that fail to match the modified tieFormat MUST have an appropriate tieFormat attached from higher in the hierarchy
    const inheritedTieFormat = drawDefaultTieFormat || eventDefaultTieFormat;
    const { modifiedCount: modified, error } = processStructure({
      inheritedTieFormat,
      structure,
    });
    if (error) return { error };
    modifiedStructuresCount += modified;

    structure.tieFormat = uniqueTieFormat;
    modifiedCount += 1;
    modifyDrawNotice({
      structureIds: [structure.structureId],
      eventId: event?.eventId,
      drawDefinition,
    });
  } else if (drawDefinition) {
    processDrawDefinition({ drawDefinition });
    drawDefinition.tieFormat = uniqueTieFormat;
    modifiedCount += 1;
  } else {
    return { error: MISSING_DRAW_DEFINITION };
  }

  return {
    ...SUCCESS,
    modifiedStructuresCount,
    newCollectionId,
    modifiedCount,
    tieFormat,
  };

  function processDrawDefinition({ drawDefinition }) {
    const modifiedStructureIds = [];
    for (const structure of drawDefinition.structures || []) {
      // if a sub-structure has a tieFormat then setting drawDefinition.tieFormat will have no effect
      if (structure.tieFormat) continue;
      const inheritedTieFormat = eventDefaultTieFormat;
      const { modifiedCount } = processStructure({
        inheritedTieFormat,
        structure,
      });
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
      let updateCollectionId;
      const tieMatchUpsMap = instanceCount(
        matchUp.tieMatchUps?.map(({ collectionId }) => collectionId)
      );

      if (!mapsCheck(collectionMap, tieMatchUpsMap)) {
        if (inheritedTieFormat) {
          // do not update collectionId
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
        matchUp.tieFormat = copyTieFormat(uniqueTieFormat);
        updateCollectionId = true;
        modified = true;
      } else if (!matchUp.tieFormat) {
        updateCollectionId = true;
      }

      if (modified) {
        modifiedCount += 1;
        modifyMatchUpNotice({
          tournamentId: tournamentRecord?.tournamentId,
          drawId: drawDefinition.drawId,
          drawDefinition,
          context: stack,
          eventId,
          matchUp,
        });
      }
      if (updateCollectionId) {
        updateTieMatchUps({ matchUp });
      }
    }

    return { modifiedCount };
  }

  function updateTieMatchUps({ matchUp }) {
    let updatedCount = 0;
    for (const tieMatchUp of matchUp.tieMatchUps) {
      if (tieMatchUp.collectionId === collectionId) {
        tieMatchUp.collectionId = newCollectionId;
        updatedCount += 1;
        modifyMatchUpNotice({
          tournamentId: tournamentRecord?.tournamentId,
          drawId: drawDefinition.drawId,
          matchUp: tieMatchUp,
          drawDefinition,
          context: stack,
          eventId,
        });
      }
    }

    return updatedCount;
  }
}
