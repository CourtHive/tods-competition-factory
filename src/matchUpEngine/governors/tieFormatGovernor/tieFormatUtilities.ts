import { mustBeAnArray } from '../../../utilities/mustBeAnArray';
import { matchUpFormatCode } from '../matchUpFormatGovernor';
import { unique, UUID } from '../../../utilities';
import {
  decorateResult,
  ResultType,
} from '../../../global/functions/decorateResult';

import { INVALID_TIE_FORMAT } from '../../../constants/errorConditionConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import {
  CollectionDefinition,
  TieFormat,
  TypeEnum,
} from '../../../types/tournamentFromSchema';

type ValidateTieFormatArgs = {
  checkCollectionIds?: boolean;
  tieFormat?: any; // not using TieFormat type because incoming value is potentially invalid
};

export function validateTieFormat(params: ValidateTieFormatArgs): ResultType {
  const checkCollectionIds = params?.checkCollectionIds;
  const tieFormat = params?.tieFormat;

  const stack = 'validateTieFormat';
  const errors: string[] = [];

  if (typeof tieFormat !== 'object') {
    errors.push('tieFormat must be an object');
    return decorateResult({
      result: {
        error: INVALID_TIE_FORMAT,
        stack,
        context: { tieFormat, errors },
      },
    });
  }

  if (typeof tieFormat.winCriteria !== 'object') {
    errors.push('tieFormat.winCriteria must be an object');
    return decorateResult({
      result: {
        error: INVALID_TIE_FORMAT,
        stack,
        context: { tieFormat, errors },
      },
    });
  }

  if (!Array.isArray(tieFormat.collectionDefinitions)) {
    errors.push(mustBeAnArray('tieFormat.collectionDefinitions'));
    return decorateResult({
      result: {
        error: INVALID_TIE_FORMAT,
        stack,
        context: { tieFormat, errors },
      },
    });
  }

  let aggregateValueImperative;
  const validCollections = tieFormat.collectionDefinitions.every(
    (collectionDefinition) => {
      const { setValue, scoreValue, collectionValue } = collectionDefinition;
      if ((setValue || scoreValue) && !collectionValue)
        aggregateValueImperative = true;
      const { valid, errors: collectionDefinitionErrors } =
        validateCollectionDefinition({
          collectionDefinition,
          checkCollectionIds,
        });

      if (valid) {
        return true;
      } else if (Array.isArray(collectionDefinitionErrors)) {
        errors.push(...collectionDefinitionErrors);
      }
      return false;
    }
  );

  const validWinCriteria =
    (typeof tieFormat.winCriteria?.valueGoal === 'number' &&
      tieFormat.winCriteria?.valueGoal > 0 &&
      !aggregateValueImperative) ||
    tieFormat.winCriteria?.aggregateValue;

  if (!(validWinCriteria || tieFormat.winCriteria?.aggregateValue)) {
    if (aggregateValueImperative) {
      errors.push('aggregateValue is required');
    } else {
      errors.push(
        'Either non-zero valueGoal, or { aggregateValue: true } must be specified in winCriteria'
      );
    }
    return decorateResult({
      result: {
        context: { tieFormat, errors, aggregateValueImperative },
        error: INVALID_TIE_FORMAT,
        stack,
      },
    });
  }

  const collectionIds = tieFormat.collectionDefinitions.map(
    ({ collectionId }) => collectionId
  );
  const uniqueCollectionIds =
    !checkCollectionIds ||
    collectionIds.length === unique(collectionIds).length;

  const valid = validCollections && validWinCriteria && uniqueCollectionIds;

  const result = { valid, errors };
  if (!valid) {
    return decorateResult({
      result: {
        context: { tieFormat, errors },
        error: INVALID_TIE_FORMAT,
        stack,
      },
    });
  }
  return result;
}

type ValidateCollectionDefinitionArgs = {
  collectionDefinition: CollectionDefinition;
  checkValueDefinition?: boolean;
  checkCollectionIds?: boolean;
};
export function validateCollectionDefinition({
  checkValueDefinition = true, // disabling allows collection to be added with no value, e.g. "Exhibition Matches"
  collectionDefinition,
  checkCollectionIds,
}: ValidateCollectionDefinitionArgs) {
  const errors: string[] = [];

  if (typeof collectionDefinition !== 'object') {
    errors.push(
      `collectionDefinition must be an object: ${collectionDefinition}`
    );
    return { errors };
  }

  const {
    collectionValueProfiles,
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
  if (
    matchUpType &&
    ![TypeEnum.Singles, TypeEnum.Doubles].includes(matchUpType)
  ) {
    errors.push(`matchUpType must be SINGLES or DOUBLES: ${matchUpType}`);
    return { errors };
  }

  if (
    checkValueDefinition &&
    !matchUpValue &&
    !collectionValue &&
    !collectionValueProfiles &&
    !scoreValue &&
    !setValue
  ) {
    errors.push(
      'Missing value definition for matchUps: matchUpValue, collectionValue, or collectionValueProfiles'
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
  if (collectionValueProfiles) {
    const result = validateCollectionValueProfile({
      collectionValueProfiles,
      matchUpCount,
    });
    if (result.errors) {
      errors.push(...result.errors);
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
export function checkTieFormat(
  tieFormat
): ResultType & { tieFormat?: TieFormat } {
  const result = validateTieFormat({ tieFormat, checkCollectionIds: false });
  if (result.error) return result;

  for (const collectionDefinition of tieFormat.collectionDefinitions) {
    if (!collectionDefinition.collectionId)
      collectionDefinition.collectionId = UUID();
  }

  return { tieFormat };
}

export function validateCollectionValueProfile({
  collectionValueProfiles,
  matchUpCount,
}) {
  const errors: string[] = [];
  if (!Array.isArray(collectionValueProfiles)) {
    errors.push(
      `collectionValueProfiles is not an array: ${collectionValueProfiles}`
    );
    return { errors };
  }
  if (
    collectionValueProfiles.length &&
    collectionValueProfiles.length !== matchUpCount
  ) {
    errors.push(`collectionValueProfiles do not align with matchUpsCount`);
    return { errors };
  }
  for (const valueProfile of collectionValueProfiles) {
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
  const collectionPositions = collectionValueProfiles.map(
    (valueProfile) => valueProfile.collectionPosition
  );
  if (collectionPositions.length !== unique(collectionPositions).length) {
    errors.push('collectionPositions are not unique');
    return { errors };
  }

  return { ...SUCCESS };
}
