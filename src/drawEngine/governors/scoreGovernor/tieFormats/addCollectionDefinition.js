import { findMatchUp } from '../../../getters/getMatchUps/findMatchUp';
import { findStructure } from '../../../getters/findStructure';
import { calculateWinCriteria } from './calculateWinCriteria';
import { UUID } from '../../../../utilities';
import {
  validateCollectionDefinition,
  validateTieFormat,
} from './tieFormatUtilities';

import { SUCCESS } from '../../../../constants/resultConstants';
import {
  DUPLICATE_VALUE,
  INVALID_VALUES,
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
  structureId,
  matchUpId,
  event,
}) {
  const { valid, errors } = validateCollectionDefinition({
    collectionDefinition,
  });
  if (!valid) return { error: INVALID_VALUES, errors };

  let tieFormat;

  if (event?.tieFormat) {
    tieFormat = event.tieFormat;
  } else if (matchUpId) {
    const { error, matchUp, structure } = findMatchUp({
      drawDefinition,
      matchUpId,
    });
    if (error) return { error };

    tieFormat =
      matchUp.tieFormat ||
      (structureId && structure.tieFormat) ||
      drawDefinition.tieFormat;
  } else if (structureId) {
    const { structure } = findStructure({ drawDefinition, structureId });
    tieFormat = structure.tieFormat || drawDefinition.tieFormat;
  }

  const result = validateTieFormat({ tieFormat });
  if (!result.valid) return { error: INVALID_VALUES, errors: result.errors };

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

  // if there are existing collectionOrder values, add collectionOrder
  const collectionOrders =
    tieFormat.collectionDefinitions
      .map(
        ({ collectionOrder }) =>
          !isNaN(collectionOrder) && parseInt(collectionOrder)
      )
      ?.filter(Boolean) || [];

  if (collectionOrders.length) {
    collectionDefinition.collectionOrder = Math.max(0, ...collectionOrders) + 1;
  }

  tieFormat.collectionDefinitions.push(collectionDefinition);

  // calculate new winCriteria for tieFormat
  // if existing winCriteria is aggregateValue, retain
  const { aggregateValue, valueGoal } = calculateWinCriteria({
    collectionDefinitions: tieFormat.collectionDefinitions,
  });

  tieFormat.winCriteria = { aggregateValue, valueGoal };

  return { ...SUCCESS };
}
