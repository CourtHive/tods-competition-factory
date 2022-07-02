import { validateCollectionValueProfile } from './tieFormatUtilities';
import { isConvertableInteger } from '../../../../utilities/math';
import { definedAttributes } from '../../../../utilities/objects';
import { isValid } from '../../matchUpFormatGovernor/isValid';
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

  // value assignment, only one is allowed to have a value
  collectionValueProfile,
  collectionValue,
  matchUpValue,
  scoreValue,
  setValue,
}) {
  if (matchUpFormat && !isValid(matchUpFormat))
    return { error: INVALID_VALUES };
  if (collectionName && typeof collectionName !== 'string')
    return { error: INVALID_VALUES };

  const valueAssignments = {
    collectionValueProfile,
    collectionValue,
    matchUpValue,
    scoreValue,
    setValue,
  };

  if (
    !Object.values(valueAssignments).filter(Boolean).length &&
    !collectionOrder &&
    !collectionName &&
    !matchUpFormat
  )
    return { error: MISSING_VALUE };

  if (Object.values(valueAssignments).filter(Boolean).length > 1)
    return {
      error: INVALID_VALUES,
      info: 'Only one value assignment allowed per collectionDefinition',
    };

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

  const value = collectionValue || matchUpValue || scoreValue || setValue;
  if (value || collectionValueProfile) {
    if (value) {
      if (!isConvertableInteger(value)) return { error: INVALID_VALUES, value };
    } else if (collectionValueProfile) {
      const result = validateCollectionValueProfile({
        matchUpCount: collectionDefinition.matchUpCount,
        collectionValueProfile,
      });
      if (result.errors) {
        return { error: INVALID_VALUES, info: result.errors };
      }
    }

    // cleanup any previously existing value assignment
    collectionDefinition.collectionValue = undefined;
    collectionDefinition.matchUpValue = undefined;
    collectionDefinition.scoreValue = undefined;
    collectionDefinition.setValue = undefined;

    // add new value assignment
    Object.assign(collectionDefinition, valueAssignments);
  }

  if (collectionName) collectionDefinition.collectionName = collectionName;
  if (matchUpFormat) collectionDefinition.matchUpFormat = matchUpFormat;
  if (collectionOrder) collectionDefinition.collectionOrder = collectionOrder;

  // cleanup any undefined attributes
  tieFormat.collectionDefinitions = tieFormat.collectionDefinitions.map((def) =>
    def.collectionId === collectionId
      ? definedAttributes(collectionDefinition)
      : def
  );

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
