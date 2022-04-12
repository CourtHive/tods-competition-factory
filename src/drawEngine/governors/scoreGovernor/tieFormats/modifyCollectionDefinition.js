// import { getAllStructureMatchUps } from '../../../getters/getMatchUps/getAllStructureMatchUps';
import { isValid } from '../matchUpFormatCode/isValid';
import { makeDeepCopy } from '../../../../utilities';
import { updateTieFormat } from './updateTieFormat';
import { getTieFormat } from './getTieFormat';
/*
import {
  modifyDrawNotice,
  modifyMatchUpNotice,
} from '../../../notifications/drawNotifications';
*/

// import { COMPLETED } from '../../../../constants/matchUpStatusConstants';
// import { TEAM } from '../../../../constants/matchUpTypes';
import {
  INVALID_VALUES,
  // MISSING_DRAW_DEFINITION,
  MISSING_VALUE,
  NOT_FOUND,
} from '../../../../constants/errorConditionConstants';

// all child matchUps need to be checked for collectionAssignments / collectionPositions which need to be removed when collectionDefinition.collectionIds are removed
export function modifyCollectionDefinition({
  tournamentRecord,
  collectionOrder,
  collectionName,
  drawDefinition,
  matchUpFormat,
  collectionId,
  structureId,
  matchUpId,
  eventId,
  event,
}) {
  if (!matchUpFormat && !collectionName && !collectionOrder)
    return { error: MISSING_VALUE };
  if (matchUpFormat && !isValid(matchUpFormat))
    return { error: INVALID_VALUES };
  if (collectionName && typeof collectionName !== 'string')
    return { error: INVALID_VALUES };

  let result = getTieFormat({
    drawDefinition,
    structureId,
    matchUpId,
    eventId,
    event,
  });
  if (result.error) return result;

  const { matchUp, structure, tieFormat: existingTieFormat } = result;
  const tieFormat = makeDeepCopy(existingTieFormat, false, true);

  const collectionDefinition = tieFormat.collectionDefinitions.find(
    (collectionDefinition) => collectionDefinition.collectionId === collectionId
  );
  if (!collectionDefinition) return { error: NOT_FOUND };

  if (collectionName) collectionDefinition.collectionName = collectionName;
  if (matchUpFormat) collectionDefinition.matchUpFormat = matchUpFormat;
  if (collectionOrder) collectionDefinition.collectionOrder = collectionOrder;

  return updateTieFormat({
    tournamentRecord,
    drawDefinition,
    structure,
    tieFormat,
    eventId,
    matchUp,
    event,
  });

  /*
  if (event && eventId) {
    event.tieFormat = tieFormat;
  } else if (matchUp) {
    matchUp.tieFormat = tieFormat;
    modifyMatchUpNotice({
      tournamentId: tournamentRecord?.tournamentId,
      drawDefinition,
      matchUp,
    });
  } else if (structure) {
    updateStructureMatchUps({
      tournamentRecord,
      drawDefinition,
      structure,
      tieFormat,
    });
    modifyDrawNotice({ drawDefinition, structureIds: [structureId] });
  } else if (drawDefinition) {
    drawDefinition.tieFormat = tieFormat;
    const modifiedStructureIds = [];

    for (const structure of drawDefinition.structures || []) {
      updateStructureMatchUps({
        tournamentRecord,
        drawDefinition,
        structure,
        tieFormat,
      });
      modifiedStructureIds.push(structureId);
    }
    modifyDrawNotice({ drawDefinition, structureIds: modifiedStructureIds });
  } else {
    return { error: MISSING_DRAW_DEFINITION };
  }
  */
}

/*
function updateStructureMatchUps({
  tournamentRecord,
  drawDefinition,
  structure,
  tieFormat,
}) {
  const matchUps = getAllStructureMatchUps({
    matchUpFilters: { matchUpTypes: [TEAM] },
    structure,
  })?.matchUps;
  // all team matchUps in the structure which do not have tieFormats should have matchUps added

  const targetMatchUps = matchUps.filter(
    (matchUp) => matchUp.matchUpStatus !== COMPLETED
  );
  for (const matchUp of targetMatchUps) {
    // don't update matchUps which are already COMPLETED
    matchUp.tieFormat = tieFormat;
    modifyMatchUpNotice({
      tournamentId: tournamentRecord?.tournamentId,
      drawDefinition,
      matchUp,
    });
  }
}
*/
