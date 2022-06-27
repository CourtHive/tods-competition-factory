import { getAllStructureMatchUps } from '../../../getters/getMatchUps/getAllStructureMatchUps';
import { generateCollectionMatchUps } from '../../../generators/tieMatchUps';
import { calculateWinCriteria } from './calculateWinCriteria';
import { copyTieFormat } from './copyTieFormat';
import { getTieFormat } from './getTieFormat';
import { UUID } from '../../../../utilities';
import { validUpdate } from './validUpdate';
import {
  addMatchUpsNotice,
  modifyDrawNotice,
  modifyMatchUpNotice,
} from '../../../notifications/drawNotifications';
import {
  validateCollectionDefinition,
  validateTieFormat,
} from './tieFormatUtilities';

import { SUCCESS } from '../../../../constants/resultConstants';
import { TEAM } from '../../../../constants/matchUpTypes';
import {
  CANNOT_MODIFY_TIEFORMAT,
  DUPLICATE_VALUE,
  INVALID_VALUES,
  MISSING_DRAW_DEFINITION,
} from '../../../../constants/errorConditionConstants';

/*
 * collectionDefinition will be added to an event tieFormat (if present)
 * if a matchUpId is provided, will be added to matchUp.tieFormat
 * if a structureId is provided, will be added to structure.tieFormat
 * TODO: determine whether all contained instances of tieFormat should be updated
 */
export function addCollectionDefinition({
  updateInProgressMatchUps = true,
  collectionDefinition,
  tournamentRecord,
  drawDefinition,
  tieFormatName,
  structureId,
  matchUpId,
  eventId,
  uuids,
  event,
}) {
  const { valid, errors } = validateCollectionDefinition({
    collectionDefinition,
  });
  if (!valid) return { error: INVALID_VALUES, errors };

  let result = getTieFormat({
    drawDefinition,
    structureId,
    matchUpId,
    eventId,
    event,
  });
  if (result.error) return result;

  const { matchUp, structure, tieFormat: existingTieFormat } = result;
  const tieFormat = copyTieFormat(existingTieFormat);

  result = validateTieFormat({ tieFormat });
  if (result.error) return result;

  const originalValueGoal = tieFormat.winCriteria.valueGoal;

  if (!collectionDefinition.collectionId) {
    collectionDefinition.collectionId = UUID();
  } else {
    const collectionIds = tieFormat.collectionDefinitions.map(
      ({ collectionId }) => collectionId
    );
    if (collectionIds.includes(collectionDefinition.collectionId))
      return {
        error: DUPLICATE_VALUE,
        collectionId: collectionDefinition.collectionId,
      };
  }

  tieFormat.collectionDefinitions.push(collectionDefinition);
  tieFormat.collectionDefinitions
    .sort((a, b) => (a.collectionOrder || 0) - (b.collectionOrder || 0))
    .forEach(
      (collectionDefinition, i) =>
        (collectionDefinition.collectionOrder = i + 1)
    );

  // calculate new winCriteria for tieFormat
  // if existing winCriteria is aggregateValue, retain
  const { aggregateValue, valueGoal } = calculateWinCriteria({
    collectionDefinitions: tieFormat.collectionDefinitions,
  });

  tieFormat.winCriteria = { aggregateValue, valueGoal };

  // if valueGoal has changed, force renaming of the tieFormat
  if (originalValueGoal && originalValueGoal !== valueGoal) {
    if (tieFormatName) {
      tieFormat.tieFormatName = tieFormatName;
    } else {
      delete tieFormat.tieFormatName;
    }
  }

  const modifiedStructureIds = [];
  const addedMatchUps = [];
  let targetMatchUps = [];

  if (eventId) {
    event.tieFormat = tieFormat;

    // all team matchUps in the event which do not have tieFormats and where draws/strucures do not have tieFormats should have matchUps added
    for (const drawDefinition of event.drawDefinitions || []) {
      if (drawDefinition.tieFormat) continue;
      for (const structure of drawDefinition.structures || []) {
        if (structure.tieFormat) continue;
        const result = updateStructureMatchUps({
          updateInProgressMatchUps,
          collectionDefinition,
          structure,
          uuids,
        });
        addedMatchUps.push(...result.newMatchUps);
        targetMatchUps.push(...result.targetMatchUps);
        modifiedStructureIds.push(structure.structureId);
      }
    }

    queueNoficiations({
      structureIds: modifiedStructureIds,
      modifiedMatchUps: targetMatchUps,
      eventId: event?.eventId,
      tournamentRecord,
      drawDefinition,
      addedMatchUps,
    });
  } else if (structureId && structure) {
    structure.tieFormat = tieFormat;
    const result = updateStructureMatchUps({
      updateInProgressMatchUps,
      collectionDefinition,
      structure,
      uuids,
    });
    addedMatchUps.push(...result.newMatchUps);
    targetMatchUps = result.targetMatchUps;

    queueNoficiations({
      modifiedMatchUps: targetMatchUps,
      structureIds: [structureId],
      eventId: event?.eventId,
      tournamentRecord,
      drawDefinition,
      addedMatchUps,
    });
  } else if (matchUpId && matchUp) {
    if (
      !validUpdate({ matchUp, updateInProgressMatchUps }) ||
      matchUp.tieFormat
    )
      return { error: CANNOT_MODIFY_TIEFORMAT };

    matchUp.tieFormat = tieFormat;
    const { matchUps: newMatchUps = [] } = generateCollectionMatchUps({
      collectionDefinition,
      uuids,
    });

    if (!Array.isArray(matchUp.tieMatchUps)) matchUp.tieMatchUps = [];
    matchUp.tieMatchUps.push(...newMatchUps);

    queueNoficiations({
      modifiedMatchUps: [matchUp],
      eventId: event?.eventId,
      tournamentRecord,
      drawDefinition,
      addedMatchUps,
    });
  } else if (drawDefinition) {
    // all team matchUps in the drawDefinition which do not have tieFormats and where strucures do not have tieFormats should have matchUps added
    drawDefinition.tieFormat = tieFormat;

    for (const structure of drawDefinition.structures || []) {
      const result = updateStructureMatchUps({
        updateInProgressMatchUps,
        collectionDefinition,
        structure,
        uuids,
      });
      modifiedStructureIds.push(structureId);
      addedMatchUps.push(...result.newMatchUps);
      targetMatchUps.push(...result.targetMatchUps);
    }

    queueNoficiations({
      structureIds: modifiedStructureIds,
      modifiedMatchUps: targetMatchUps,
      eventId: event?.eventId,
      tournamentRecord,
      drawDefinition,
      addedMatchUps,
    });
  } else {
    return { error: MISSING_DRAW_DEFINITION };
  }

  return { ...SUCCESS, tieFormat, addedMatchUps, targetMatchUps };
}

function updateStructureMatchUps({
  updateInProgressMatchUps,
  collectionDefinition,
  structure,
  uuids,
}) {
  const newMatchUps = [];
  const matchUps = getAllStructureMatchUps({
    matchUpFilters: { matchUpTypes: [TEAM] },
    structure,
  })?.matchUps;

  // all team matchUps in the structure which are not completed and which have no score value should have matchUps added
  const targetMatchUps = matchUps.filter(
    (matchUp) =>
      validUpdate({ matchUp, updateInProgressMatchUps }) && !matchUp.tieFormat
  );

  for (const matchUp of targetMatchUps) {
    const tieMatchUps = generateCollectionMatchUps({
      collectionDefinition,
      uuids,
    });

    if (!Array.isArray(matchUp.tieMatchUps)) matchUp.tieMatchUps = [];
    matchUp.tieMatchUps.push(...tieMatchUps);
    newMatchUps.push(...tieMatchUps);
  }
  return { newMatchUps, targetMatchUps };
}

function queueNoficiations({
  modifiedStructureIds,
  tournamentRecord,
  modifiedMatchUps,
  drawDefinition,
  addedMatchUps,
  eventId,
}) {
  addMatchUpsNotice({
    tournamentId: tournamentRecord?.tournamentId,
    matchUps: addedMatchUps,
    drawDefinition,
    eventId,
  });
  modifiedMatchUps?.forEach((matchUp) => {
    modifyMatchUpNotice({
      tournamentId: tournamentRecord?.tournamentId,
      drawDefinition,
      matchUp,
      eventId,
    });
  });
  modifyDrawNotice({
    structureIds: modifiedStructureIds,
    drawDefinition,
    eventId,
  });
}
