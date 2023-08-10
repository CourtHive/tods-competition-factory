import { getAllStructureMatchUps } from '../../../drawEngine/getters/getMatchUps/getAllStructureMatchUps';
import { getAppliedPolicies } from '../../../global/functions/deducers/getAppliedPolicies';
import { generateCollectionMatchUps } from '../../../drawEngine/generators/tieMatchUps';
import { definedAttributes } from '../../../utilities/objects';
import { calculateWinCriteria } from './calculateWinCriteria';
import { getTieFormat } from './getTieFormat/getTieFormat';
import { tieFormatTelemetry } from './tieFormatTelemetry';
import { copyTieFormat } from './copyTieFormat';
import { validUpdate } from './validUpdate';
import { UUID } from '../../../utilities';
import {
  addMatchUpsNotice,
  modifyDrawNotice,
  modifyMatchUpNotice,
} from '../../../drawEngine/notifications/drawNotifications';
import {
  validateCollectionDefinition,
  validateTieFormat,
} from './tieFormatUtilities';

import { TIE_FORMAT_MODIFICATIONS } from '../../../constants/extensionConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import { TEAM } from '../../../constants/matchUpTypes';
import {
  CANNOT_MODIFY_TIEFORMAT,
  DUPLICATE_VALUE,
  INVALID_VALUES,
  MISSING_DRAW_DEFINITION,
} from '../../../constants/errorConditionConstants';

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
  matchUp,
  eventId,
  uuids,
  event,
}) {
  const { valid, errors } = validateCollectionDefinition({
    collectionDefinition,
  });
  if (!valid) return { error: INVALID_VALUES, errors };
  const stack = 'addCollectionDefinition';

  let result =
    !matchUp &&
    getTieFormat({
      drawDefinition,
      structureId,
      matchUpId,
      eventId,
      event,
    });
  if (result?.error) return { error: result.error };

  const { structure } = result;
  matchUp = matchUp || result.matchUp;
  const existingTieFormat = result.tieFormat;
  const tieFormat = copyTieFormat(existingTieFormat);

  result = validateTieFormat({ tieFormat });
  if (result?.error) return { error: result.error };

  if (!collectionDefinition.collectionId) {
    collectionDefinition.collectionId = UUID();
  } else {
    const collectionIds = tieFormat.collectionDefinitions.map(
      ({ collectionId }) => collectionId
    );
    if (collectionIds.includes(collectionDefinition.collectionId))
      return {
        collectionId: collectionDefinition.collectionId,
        error: DUPLICATE_VALUE,
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
  const { aggregateValue, valueGoal } = calculateWinCriteria(tieFormat);
  tieFormat.winCriteria = definedAttributes({ aggregateValue, valueGoal });

  // if valueGoal has changed, force renaming of the tieFormat
  const originalValueGoal = existingTieFormat.winCriteria.valueGoal;
  const wasAggregateValue = existingTieFormat.winCriteria.aggregateValue;
  if (
    (originalValueGoal && originalValueGoal !== valueGoal) ||
    (aggregateValue && !wasAggregateValue)
  ) {
    if (tieFormatName) {
      tieFormat.tieFormatName = tieFormatName;
    } else {
      delete tieFormat.tieFormatName;
    }
  }

  const modifiedStructureIds = [];
  const addedMatchUps = [];
  let targetMatchUps = [];

  const prunedTieFormat = definedAttributes(tieFormat);
  result = validateTieFormat({ tieFormat: prunedTieFormat });
  if (result?.error) return { error: result.error };

  if (eventId) {
    event.tieFormat = prunedTieFormat;

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
      stack,
    });
  } else if (structureId && structure) {
    structure.tieFormat = prunedTieFormat;
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
      stack,
    });
  } else if (matchUpId && matchUp) {
    if (!validUpdate({ matchUp, updateInProgressMatchUps }))
      return { error: CANNOT_MODIFY_TIEFORMAT };

    matchUp.tieFormat = prunedTieFormat;
    const newMatchUps = generateCollectionMatchUps({
      collectionDefinition,
      uuids,
    });

    if (!Array.isArray(matchUp.tieMatchUps)) matchUp.tieMatchUps = [];
    matchUp.tieMatchUps.push(...newMatchUps);
    addedMatchUps.push(...newMatchUps);

    queueNoficiations({
      modifiedMatchUps: [matchUp],
      eventId: event?.eventId,
      tournamentRecord,
      drawDefinition,
      addedMatchUps,
      stack,
    });
  } else if (drawDefinition) {
    // all team matchUps in the drawDefinition which do not have tieFormats and where strucures do not have tieFormats should have matchUps added
    drawDefinition.tieFormat = prunedTieFormat;

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
      stack,
    });
  } else {
    return { error: MISSING_DRAW_DEFINITION };
  }

  const { appliedPolicies } = getAppliedPolicies({ tournamentRecord });
  if (appliedPolicies?.audit?.[TIE_FORMAT_MODIFICATIONS]) {
    const auditData = definedAttributes({
      drawId: drawDefinition?.drawId,
      collectionDefinition,
      action: stack,
      structureId,
      matchUpId,
      eventId,
    });
    tieFormatTelemetry({ drawDefinition, auditData });
  }

  return {
    ...SUCCESS,
    tieFormat: prunedTieFormat,
    targetMatchUps,
    addedMatchUps,
  };
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
  stack,
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
      context: stack,
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
