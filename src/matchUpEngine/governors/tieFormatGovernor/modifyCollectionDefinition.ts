import { getAppliedPolicies } from '../../../global/functions/deducers/getAppliedPolicies';
import { genderConstants } from '../../../constants/genderConstants';
import { isConvertableInteger } from '../../../utilities/math';
import { definedAttributes } from '../../../utilities/objects';
import { calculateWinCriteria } from './calculateWinCriteria';
import { getTieFormat } from './getTieFormat/getTieFormat';
import { isValid } from '../matchUpFormatGovernor/isValid';
import { tieFormatTelemetry } from './tieFormatTelemetry';
import { updateTieFormat } from './updateTieFormat';
import { intersection } from '../../../utilities';
import { copyTieFormat } from './copyTieFormat';
import {
  ResultType,
  decorateResult,
} from '../../../global/functions/decorateResult';
import {
  validateCollectionValueProfiles,
  validateTieFormat,
} from './tieFormatUtilities';

import { TIE_FORMAT_MODIFICATIONS } from '../../../constants/extensionConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import {
  Category,
  CollectionValueProfile,
  DrawDefinition,
  Event,
  GenderEnum,
  TieFormat,
  Tournament,
  TypeEnum,
} from '../../../types/tournamentFromSchema';
import {
  INVALID_VALUES,
  MISSING_VALUE,
  NOT_FOUND,
  NOT_IMPLEMENTED,
} from '../../../constants/errorConditionConstants';

// all child matchUps need to be checked for collectionAssignments / collectionPositions which need to be removed when collectionDefinition.collectionIds are removed
type ModifyCollectionDefinitionArgs = {
  updateInProgressMatchUps?: boolean;
  tournamentRecord?: Tournament;
  drawDefinition?: DrawDefinition;
  collectionOrder?: number;
  collectionName?: string;
  tieFormatName?: string;
  matchUpFormat?: string;
  matchUpType?: TypeEnum;
  matchUpCount?: number;
  collectionId: string;
  structureId?: string;
  category?: Category;
  gender?: GenderEnum;
  matchUpId?: string;
  eventId?: string;
  event?: Event;

  // value assignment, only one is allowed to have a value
  collectionValueProfiles?: CollectionValueProfile[];
  collectionValue?: number;
  matchUpValue?: number;
  scoreValue?: number;
  setValue?: number;
};

export function modifyCollectionDefinition({
  updateInProgressMatchUps = false,
  tournamentRecord,
  collectionOrder,
  collectionName,
  tieFormatName,
  drawDefinition,
  matchUpFormat,
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
}: ModifyCollectionDefinitionArgs): ResultType & {
  tieFormat?: TieFormat;
  modifications?: any[];
} {
  const stack = 'modifyCollectionDefinition';

  if (matchUpFormat && !isValid(matchUpFormat)) {
    return decorateResult({
      result: { error: INVALID_VALUES },
      context: { matchUpFormat },
      stack,
    });
  }
  if (collectionName && typeof collectionName !== 'string') {
    return decorateResult({
      result: { error: INVALID_VALUES },
      context: { collectionName },
      stack,
    });
  }
  if (gender && !Object.values(genderConstants).includes(gender)) {
    return decorateResult({
      result: { error: INVALID_VALUES },
      context: { gender },
      stack,
    });
  }
  if (category && typeof category !== 'object') {
    return decorateResult({
      result: { error: INVALID_VALUES },
      context: { category },
      stack,
    });
  }

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
      info: 'Only one value assignment allowed per collectionDefinition',
      result: { error: INVALID_VALUES },
      stack,
    });

  let result = getTieFormat({
    drawDefinition,
    structureId,
    matchUpId,
    eventId,
    event,
  });
  if (result.error) {
    return decorateResult({ result, stack });
  }

  const { matchUp, structure, tieFormat: existingTieFormat } = result;
  const tieFormat = copyTieFormat(existingTieFormat);

  const sourceCollectionDefinition =
    existingTieFormat?.collectionDefinitions.find(
      (collectionDefinition) =>
        collectionDefinition.collectionId === collectionId
    );
  const targetCollectionDefinition = tieFormat?.collectionDefinitions.find(
    (collectionDefinition) => collectionDefinition.collectionId === collectionId
  );

  if (!sourceCollectionDefinition)
    return decorateResult({ result: { error: NOT_FOUND }, stack });

  const value = collectionValue ?? matchUpValue ?? scoreValue ?? setValue;
  if (collectionValueProfiles) {
    const result = validateCollectionValueProfiles({
      matchUpCount: matchUpCount || sourceCollectionDefinition?.matchUpCount,
      collectionValueProfiles,
    });
    if (result.errors) {
      return decorateResult({
        result: { error: INVALID_VALUES },
        info: result.errors,
        stack,
      });
    }
  } else if (value && !isConvertableInteger(value)) {
    return decorateResult({
      result: { error: INVALID_VALUES },
      info: 'value is not an integer',
      context: { value },
      stack,
    });
  }

  const equivalentValueProfiles = (a, b) =>
    intersection(Object.keys(a), Object.keys(b)).length ===
      Object.keys(a).length &&
    intersection(Object.values(a), Object.values(b)).length ===
      Object.values(a).length;

  const valueProfileModified =
    collectionValueProfiles &&
    (!sourceCollectionDefinition.collectionValueProfiles ||
      !equivalentValueProfiles(
        sourceCollectionDefinition.collectionValueProfiles,
        collectionValueProfiles
      ));

  const valueModified =
    (isConvertableInteger(collectionValue) &&
      sourceCollectionDefinition.collectionValue !== collectionValue) ||
    (isConvertableInteger(matchUpValue) &&
      sourceCollectionDefinition.matchUpValue !== matchUpValue) ||
    (isConvertableInteger(scoreValue) &&
      sourceCollectionDefinition.scoreValue !== scoreValue) ||
    (isConvertableInteger(setValue) &&
      sourceCollectionDefinition.setValue !== setValue) ||
    valueProfileModified;

  const modifications: any[] = [];
  if (valueModified) {
    // cleanup any previously existing value assignment
    targetCollectionDefinition.collectionValueProfiles = undefined;
    targetCollectionDefinition.collectionValue = undefined;
    targetCollectionDefinition.matchUpValue = undefined;
    targetCollectionDefinition.scoreValue = undefined;
    targetCollectionDefinition.setValue = undefined;

    // add new value assignment
    Object.assign(targetCollectionDefinition, valueAssignments);
    modifications.push({
      collectionId,
      ...definedAttributes(valueAssignments),
    });
  }

  // must remove all collectionGroups which contain the collection which has been modified
  if (
    (isConvertableInteger(scoreValue) || isConvertableInteger(setValue)) &&
    targetCollectionDefinition.collectionGroupNumber
  ) {
    const targetCollectionGroupNumber =
      targetCollectionDefinition.collectionGroupNumber;
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
    modifications.push({
      collectionId,
      change: 'collectionGroupNumber removed',
    });
  }

  // calculate new winCriteria for tieFormat
  // if existing winCriteria is aggregateValue, retain
  const { aggregateValue, valueGoal } = calculateWinCriteria(tieFormat);
  const winCriteria = definedAttributes({ aggregateValue, valueGoal });
  if (
    winCriteria.aggregateValue !==
      existingTieFormat?.winCriteria.aggregateValue ||
    winCriteria.valueGoal !== existingTieFormat?.winCriteria.valueGoal
  ) {
    tieFormat.winCriteria = winCriteria;
    modifications.push({ collectionId, winCriteria });
  }

  if (
    isConvertableInteger(collectionOrder) &&
    sourceCollectionDefinition.collectionOrder !== collectionOrder
  ) {
    targetCollectionDefinition.collectionOrder = collectionOrder;
    modifications.push({ collectionId, collectionOrder });
  }
  if (
    collectionName &&
    sourceCollectionDefinition.collectionName !== collectionName
  ) {
    targetCollectionDefinition.collectionName = collectionName;
    modifications.push({ collectionId, collectionName });
  }
  if (
    matchUpFormat &&
    sourceCollectionDefinition.matchUpFormat !== matchUpFormat
  ) {
    targetCollectionDefinition.matchUpFormat = matchUpFormat;
    modifications.push({ collectionId, matchUpFormat });
  }
  if (
    isConvertableInteger(matchUpCount) &&
    sourceCollectionDefinition.matchUpCount !== matchUpCount
  ) {
    // TODO: need to calculate tieMatchUp additions/deletions
    // targetCollectionDefinition.matchUpCount = matchUpCount;
    // modifications.push({ structureId, matchUpCount });

    return decorateResult({
      result: { error: NOT_IMPLEMENTED },
      context: { matchUpCount },
      stack,
    });
  }
  if (matchUpType && sourceCollectionDefinition.matchUpType !== matchUpType) {
    // targetCollectionDefinition.matchUpType = matchUpType;
    // modifications.push({ collectionId, matchUpType });
    return decorateResult({
      result: { error: NOT_IMPLEMENTED },
      context: { matchUpType },
      stack,
    });
  }
  if (category && sourceCollectionDefinition.category !== category) {
    targetCollectionDefinition.category = category;
    modifications.push({ collectionId, category });
  }
  if (gender && sourceCollectionDefinition.gender !== gender) {
    // TODO: remove all inappropriately gendered participants
    targetCollectionDefinition.gender = gender;
    modifications.push({ collectionId, gender });
  }

  const prunedTieFormat = definedAttributes(tieFormat);
  result = validateTieFormat({ tieFormat: prunedTieFormat });
  if (result.error) {
    return decorateResult({ result, stack });
  }

  if (!modifications.length) {
    return decorateResult({ result: { ...SUCCESS, modifications } });
  }

  // Note: this logic needs to exist both here and in `modifyTieFormat`
  // it is duplicated because this method can be called independently
  const changedTieFormatName =
    existingTieFormat?.tieFormatName !== tieFormatName;

  // if tieFormat has changed, force renaming of the tieFormat
  if (changedTieFormatName) {
    prunedTieFormat.tieFormatName = tieFormatName;
    modifications.push({ tieFormatName });
  } else if (modifications.length) {
    delete prunedTieFormat.tieFormatName;
    modifications.push(
      'tieFormatName removed: modifications without new tieFormatName'
    );
  }
  result = updateTieFormat({
    tieFormat: prunedTieFormat,
    updateInProgressMatchUps,
    tournamentRecord,
    drawDefinition,
    structure,
    eventId,
    matchUp,
    event,
  });

  if (!result.error) {
    const { appliedPolicies } = getAppliedPolicies({ tournamentRecord });
    if (appliedPolicies?.audit?.[TIE_FORMAT_MODIFICATIONS]) {
      const auditData = definedAttributes({
        collectionDefinition: targetCollectionDefinition,
        drawId: drawDefinition?.drawId,
        action: stack,
        structureId,
        matchUpId,
        eventId,
      });
      tieFormatTelemetry({ drawDefinition, auditData });
    }
  }

  return decorateResult({ result: { ...result, modifications }, stack });
}
