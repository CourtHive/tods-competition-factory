import { calculateWinCriteria } from './calculateWinCriteria';
import { getTieFormat } from './getTieFormat';
import { UUID } from '../../../../utilities';
import {
  validateCollectionDefinition,
  validateTieFormat,
} from './tieFormatUtilities';

import { SUCCESS } from '../../../../constants/resultConstants';
import {
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
  collectionDefinition,
  drawDefinition,
  tieFormatName,
  structureId,
  matchUpId,
  eventId,
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

  const { matchUp, structure, tieFormat } = result;

  result = validateTieFormat({ tieFormat });
  if (!result.valid) return { error: INVALID_VALUES, errors: result.errors };

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

  if (eventId) {
    event.tieFormat = tieFormat;
  } else if (matchUp) {
    matchUp.tieFormat = tieFormat;
  } else if (structure) {
    structure.tieFormat = tieFormat;
  } else if (drawDefinition) {
    drawDefinition.tieFormat = tieFormat;
  } else {
    return { error: MISSING_DRAW_DEFINITION };
  }

  return { ...SUCCESS, tieFormat };
}
