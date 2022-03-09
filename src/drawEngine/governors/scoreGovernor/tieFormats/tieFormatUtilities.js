import { matchUpFormatCode } from '../matchUpFormatCode';
import { unique, UUID } from '../../../../utilities';

import { INVALID_TIE_FORMAT } from '../../../../constants/errorConditionConstants';
import { DOUBLES, SINGLES } from '../../../../constants/matchUpTypes';

export function validateTieFormat({
  checkCollectionIds = true,
  tieFormat,
} = {}) {
  const errors = [];

  if (typeof tieFormat !== 'object') {
    errors.push('tieformat must be an object');
    return { error: INVALID_TIE_FORMAT, errors };
  }

  if (typeof tieFormat.winCriteria !== 'object') {
    errors.push('tieFormat.winCriteria must be an object');
    return { error: INVALID_TIE_FORMAT, errors };
  }

  if (!Array.isArray(tieFormat.collectionDefinitions)) {
    errors.push('tieFormat.collectionDefinitiosn must be an array of objects');
    return { error: INVALID_TIE_FORMAT, errors };
  }

  const validWinCriteria =
    (typeof tieFormat.winCriteria?.valueGoal === 'number' &&
      tieFormat.winCriteria?.valueGoal > 0) ||
    tieFormat.winCriteria?.aggregateValue;

  if (!(validWinCriteria || tieFormat.winCriteria?.aggregateValue)) {
    errors.push(
      'Either non-zero valueGoal, or { aggregateValue: true } must be specified in winCriteria'
    );
    return { error: INVALID_TIE_FORMAT, errors };
  }

  const validCollections = tieFormat.collectionDefinitions.every(
    (collectionDefinition) => {
      const { valid, errors: collectionDefinitionErrors } =
        validateCollectionDefinition({
          collectionDefinition,
          checkCollectionIds,
        });
      if (valid) {
        return true;
      } else {
        errors.push(...collectionDefinitionErrors);
        return false;
      }
    }
  );

  const collectionIds = tieFormat.collectionDefinitions.map(
    ({ collectionId }) => collectionId
  );
  const uniqueCollectionIds =
    !checkCollectionIds ||
    collectionIds.length === unique(collectionIds).length;

  const valid = validCollections && validWinCriteria && uniqueCollectionIds;

  const result = { valid, errors };
  if (!valid) result.error = INVALID_TIE_FORMAT;
  return result;
}

export function validateCollectionDefinition({
  checkValueDefinition = true, // disabling allows collection to be added with no value, e.g. "Exhibition Matches"
  collectionDefinition,
  checkCollectionIds,
}) {
  const errors = [];

  if (typeof collectionDefinition !== 'object') {
    errors.push(
      `collectionDefinition must be an object: ${collectionDefinition}`
    );
    return { errors };
  }

  const {
    collectionValueProfile,
    collectionGroupNumber,
    collectionValue,
    collectionId,
    matchUpCount,
    matchUpFormat,
    matchUpValue,
    matchUpType,
    scoreValue,
    setValue,
  } = collectionDefinition;

  if (checkCollectionIds && typeof collectionId !== 'string') {
    errors.push(`collectionId is not type string: ${collectionId}`);
    return { errors };
  }
  if (typeof matchUpCount !== 'number') {
    errors.push(`matchUpCount is not type number: ${matchUpCount}`);
    return { errors };
  }
  if (![SINGLES, DOUBLES].includes(matchUpType)) {
    errors.push(`matchUpType must be SINGLES or DOUBLES: ${matchUpType}`);
    return { errors };
  }

  if (
    checkValueDefinition &&
    !matchUpValue &&
    !collectionValue &&
    !collectionValueProfile &&
    !scoreValue &&
    !setValue
  ) {
    errors.push(
      'Missing value definition for matchUps: matchUpValue, collectionValue, or collectionValueProfile'
    );
    return { errors };
  }

  if (matchUpValue && typeof matchUpValue !== 'number') {
    errors.push(`matchUpValue is not type number: ${matchUpValue}`);
    return { errors };
  }
  if (collectionValue && typeof collectionValue !== 'number') {
    errors.push(`collectionValue is not type number: ${collectionValue}`);
    return { errors };
  }
  if (collectionValueProfile) {
    if (!Array.isArray(collectionValueProfile)) {
      errors.push(
        `collectionValueProfile is not an array: ${collectionValueProfile}`
      );
      return { errors };
    }
    if (collectionValueProfile.length !== matchUpCount) {
      errors.push(`collectionValueProfile does not align with matchUpsCount`);
      return { errors };
    }
    for (const valueProfile of collectionValueProfile) {
      if (typeof valueProfile !== 'object') {
        errors.push(`valueProfile is not type object: ${valueProfile}`);
        return { errors };
      }
      const { value, collectionPosition } = valueProfile;
      if (
        typeof value !== 'number' ||
        typeof collectionPosition !== 'number' ||
        collectionPosition > matchUpCount ||
        collectionPosition < 1
      ) {
        errors.push(
          `Invalid value profile: value and collectionPosition must be numeric. collectionPosition cannot be greater than matchUpCount`
        );
        return { errors };
      }
    }
    const collectionPositions = collectionValueProfile.map(
      (valueProfile) => valueProfile.collectionPosition
    );
    if (collectionPositions.length !== unique(collectionPositions).length) {
      errors.push('collectionPositions are not unique');
      return { errors };
    }
  }

  if (collectionGroupNumber && typeof collectionGroupNumber !== 'number') {
    errors.push(`collectionValue is not type number: ${collectionValue}`);
    return { errors };
  }

  if (matchUpFormat && !matchUpFormatCode.isValid(matchUpFormat)) {
    errors.push(`Invalid matchUpFormat: ${matchUpFormat}`);
    return { errors };
  }

  return { valid: true };
}

// add collectionIds if missing
export function checkTieFormat(tieFormat) {
  const result = validateTieFormat({ tieFormat, checkCollectionIds: false });
  if (result.error) return result;

  for (const collectionDefinition of tieFormat.collectionDefinitions) {
    if (!collectionDefinition.collectionId)
      collectionDefinition.collectionId = UUID();
  }

  return { tieFormat };
}
