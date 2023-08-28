import { getAppliedPolicies } from '../../../global/functions/deducers/getAppliedPolicies';
import { decorateResult } from '../../../global/functions/decorateResult';
import { genderConstants } from '../../../constants/genderConstants';
import { isConvertableInteger } from '../../../utilities/math';
import { definedAttributes } from '../../../utilities/objects';
import { calculateWinCriteria } from './calculateWinCriteria';
import { getTieFormat } from './getTieFormat/getTieFormat';
import { isValid } from '../matchUpFormatGovernor/isValid';
import { tieFormatTelemetry } from './tieFormatTelemetry';
import { updateTieFormat } from './updateTieFormat';
import { copyTieFormat } from './copyTieFormat';
import {
  validateCollectionValueProfile,
  validateTieFormat,
} from './tieFormatUtilities';

import { TIE_FORMAT_MODIFICATIONS } from '../../../constants/extensionConstants';
import {
  INVALID_VALUES,
  MISSING_VALUE,
  NOT_FOUND,
} from '../../../constants/errorConditionConstants';

// all child matchUps need to be checked for collectionAssignments / collectionPositions which need to be removed when collectionDefinition.collectionIds are removed
export function modifyCollectionDefinition({
  updateInProgressMatchUps = false,
  tournamentRecord,
  collectionOrder,
  collectionName,
  drawDefinition,
  matchUpFormat,
  tieFormatName,
  matchUpCount,
  collectionId,
  matchUpType,
  structureId,
  matchUpId,
  category,
  eventId,
  gender,
  event,

  // value assignment, only one is allowed to have a value
  collectionValueProfiles,
  collectionValue,
  matchUpValue,
  scoreValue,
  setValue,
}) {
  if (matchUpFormat && !isValid(matchUpFormat)) {
    return { error: INVALID_VALUES };
  }
  if (collectionName && typeof collectionName !== 'string') {
    return { error: INVALID_VALUES };
  }
  if (gender && !Object.values(genderConstants).includes(gender)) {
    return { error: INVALID_VALUES };
  }
  if (category && typeof category !== 'object') {
    return { error: INVALID_VALUES };
  }

  const stack = 'modifyCollectionDefinition';

  const valueAssignments = {
    collectionValueProfiles,
    collectionValue,
    matchUpValue,
    scoreValue,
    setValue,
  };

  if (
    !Object.values(valueAssignments).filter(Boolean).length &&
    !collectionOrder &&
    !collectionName &&
    !matchUpCount &&
    !matchUpFormat
  )
    return decorateResult({ result: { error: MISSING_VALUE }, stack });

  if (Object.values(valueAssignments).filter(Boolean).length > 1)
    return decorateResult({
      result: {
        error: INVALID_VALUES,
        info: 'Only one value assignment allowed per collectionDefinition',
      },
      stack,
    });

  let result = getTieFormat({
    drawDefinition,
    structureId,
    matchUpId,
    eventId,
    event,
  });
  if (result.error) return decorateResult({ result, stack });

  const { matchUp, structure, tieFormat: existingTieFormat } = result;
  const tieFormat = copyTieFormat(existingTieFormat);

  const collectionDefinition = tieFormat.collectionDefinitions.find(
    (collectionDefinition) => collectionDefinition.collectionId === collectionId
  );
  if (!collectionDefinition)
    return decorateResult({ result: { error: NOT_FOUND }, stack });

  const value = collectionValue || matchUpValue || scoreValue || setValue;
  if (value || collectionValueProfiles) {
    if (value) {
      if (!isConvertableInteger(value)) return { error: INVALID_VALUES, value };
    } else if (collectionValueProfiles) {
      const result = validateCollectionValueProfile({
        matchUpCount: collectionDefinition.matchUpCount,
        collectionValueProfiles,
      });
      if (result.errors) {
        return decorateResult({
          result: { error: INVALID_VALUES, info: result.errors },
          stack,
        });
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

  // must remove all collectionGroups which contain the collection which has been modified
  if ((scoreValue || setValue) && collectionDefinition.collectionGroupNumber) {
    const targetCollectionGroupNumber =
      collectionDefinition.collectionGroupNumber;
    tieFormat.collectionDefinitions = tieFormat.collectionDefinitions.map(
      (collectionDefinition) => {
        const { collectionGroupNumber, ...rest } = collectionDefinition;
        if (collectionGroupNumber === targetCollectionGroupNumber) {
          return rest;
        } else {
          return collectionDefinition;
        }
      }
    );
    tieFormat.collectionGroups = tieFormat.collectionGroups.filter(
      ({ groupNumber }) => groupNumber !== targetCollectionGroupNumber
    );
  }

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
    delete tieFormat.tieFormatName;
  }

  if (tieFormatName) tieFormat.tieFormatName = tieFormatName;

  if (collectionOrder) collectionDefinition.collectionOrder = collectionOrder;
  if (collectionName) collectionDefinition.collectionName = collectionName;
  if (matchUpFormat) collectionDefinition.matchUpFormat = matchUpFormat;
  // if (matchUpCount) collectionDefinition.matchUpCount = matchUpCount; // TODO: need to calculate tieMatchUp additions/deletions
  if (matchUpType) collectionDefinition.matchUpType = matchUpType;
  if (category) collectionDefinition.category = category;
  if (gender) collectionDefinition.gender = gender; // TODO: remove all inappropriately gendered participants

  const prunedTieFormat = definedAttributes(tieFormat);
  result = validateTieFormat({ tieFormat: prunedTieFormat });
  if (result.error) return decorateResult({ result, stack });

  result = updateTieFormat({
    tieFormat: prunedTieFormat,
    updateInProgressMatchUps,
    tournamentRecord,
    drawDefinition,
    structureId,
    structure,
    eventId,
    matchUp,
    event,
  });
  if (!result.error) {
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
  }

  return decorateResult({ result, stack });
}
