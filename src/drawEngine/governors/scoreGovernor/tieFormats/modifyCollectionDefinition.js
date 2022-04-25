import { isValid } from '../matchUpFormatCode/isValid';
import { makeDeepCopy } from '../../../../utilities';
import { updateTieFormat } from './updateTieFormat';
import { getTieFormat } from './getTieFormat';

import {
  INVALID_VALUES,
  MISSING_VALUE,
  NOT_FOUND,
} from '../../../../constants/errorConditionConstants';

// all child matchUps need to be checked for collectionAssignments / collectionPositions which need to be removed when collectionDefinition.collectionIds are removed
export function modifyCollectionDefinition({
  updateInProgressMatchUps = false,
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
    updateInProgressMatchUps,
    tournamentRecord,
    drawDefinition,
    structureId,
    structure,
    tieFormat,
    eventId,
    matchUp,
    event,
  });
}
