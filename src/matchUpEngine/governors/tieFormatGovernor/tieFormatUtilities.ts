import { tieFormatGenderValidityCheck } from '../../../global/functions/deducers/tieFormatGenderValidityCheck';
import { categoryCanContain } from '../../../global/functions/deducers/categoryCanContain';
import { mustBeAnArray } from '../../../utilities/mustBeAnArray';
import { isConvertableInteger } from '../../../utilities/math';
import { matchUpFormatCode } from '../matchUpFormatGovernor';
import { unique, UUID } from '../../../utilities';
import {
  decorateResult,
  ResultType,
} from '../../../global/functions/decorateResult';

import { SUCCESS } from '../../../constants/resultConstants';
import {
  INVALID_CATEGORY,
  INVALID_COLLECTION_DEFINITION,
  INVALID_OBJECT,
  INVALID_TIE_FORMAT,
} from '../../../constants/errorConditionConstants';
import {
  Category,
  CollectionDefinition,
  Event,
  GenderEnum,
  TieFormat,
  TypeEnum,
} from '../../../types/tournamentFromSchema';

type ValidateTieFormatArgs = {
  checkCollectionIds?: boolean;
  enforceCategory?: boolean;
  enforceGender?: boolean;
  category?: Category;
  gender?: GenderEnum;
  tieFormat?: any; // not using TieFormat type because incoming value is potentially invalid
  event?: Event;
};

export function validateTieFormat(params: ValidateTieFormatArgs): ResultType {
  const checkCategory = !!(
    params?.enforceCategory !== false && params?.category
  );
  const checkGender = !!(params?.enforceGender !== false && params?.gender);
  const checkCollectionIds = params?.checkCollectionIds;
  const tieFormat = params?.tieFormat;
  const event = params?.event;

  const stack = 'validateTieFormat';
  const errors: string[] = [];

  if (!params || !tieFormat || typeof tieFormat !== 'object') {
    errors.push('tieFormat must be an object');
    return decorateResult({
      result: { error: INVALID_TIE_FORMAT },
      context: { tieFormat, errors },
      stack,
    });
  }

  if (typeof tieFormat.winCriteria !== 'object') {
    errors.push('tieFormat.winCriteria must be an object');
    return decorateResult({
      result: { error: INVALID_TIE_FORMAT },
      context: { tieFormat, errors },
      stack,
    });
  }

  if (!Array.isArray(tieFormat.collectionDefinitions)) {
    errors.push(mustBeAnArray('tieFormat.collectionDefinitions'));
    return decorateResult({
      result: { error: INVALID_TIE_FORMAT },
      context: { tieFormat, errors },
      stack,
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
          referenceCategory: params.category,
          referenceGender: params.gender,
          collectionDefinition,
          checkCollectionIds,
          checkCategory,
          checkGender,
          event,
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
      context: { tieFormat, errors, aggregateValueImperative },
      result: { error: INVALID_TIE_FORMAT },
      stack,
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
      result: { error: INVALID_TIE_FORMAT },
      context: { tieFormat, errors },
      stack,
    });
  }
  return result;
}

type ValidateCollectionDefinitionArgs = {
  collectionDefinition: CollectionDefinition;
  referenceCategory?: Category;
  checkCollectionIds?: boolean;
  referenceGender?: GenderEnum;
  checkCategory?: boolean;
  checkGender?: boolean;
  eventType?: TypeEnum;
  event?: Event;
};
export function validateCollectionDefinition({
  checkCategory = true,
  collectionDefinition,
  checkCollectionIds,
  checkGender = true,
  referenceCategory,
  referenceGender,
  event,
}: ValidateCollectionDefinitionArgs) {
  referenceGender = referenceGender ?? event?.gender;
  const stack = 'validateCollectionDefinition';
  const errors: string[] = [];

  if (typeof collectionDefinition !== 'object') {
    errors.push(
      `collectionDefinition must be an object: ${collectionDefinition}`
    );
    return decorateResult({ result: { errors, error: INVALID_OBJECT }, stack });
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
    category,
    gender,
  } = collectionDefinition;

  if (checkCollectionIds && typeof collectionId !== 'string') {
    errors.push(`collectionId is not type string: ${collectionId}`);
  }
  if (typeof matchUpCount !== 'number') {
    errors.push(`matchUpCount is not type number: ${matchUpCount}`);
  }
  if (
    matchUpType &&
    ![TypeEnum.Singles, TypeEnum.Doubles].includes(matchUpType)
  ) {
    errors.push(`matchUpType must be SINGLES or DOUBLES: ${matchUpType}`);
  }

  const valueDeclarations = [!!collectionValueProfiles?.length]
    .concat(
      [matchUpValue, collectionValue, scoreValue, setValue].map(
        isConvertableInteger
      )
    )
    .filter(Boolean);

  if (valueDeclarations.length !== 1) {
    errors.push(
      'Missing value definition for matchUps: matchUpValue, collectionValue, or collectionValueProfiles'
    );
  }

  if (matchUpValue && typeof matchUpValue !== 'number') {
    errors.push(`matchUpValue is not type number: ${matchUpValue}`);
  }
  if (collectionValue && typeof collectionValue !== 'number') {
    errors.push(`collectionValue is not type number: ${collectionValue}`);
  }
  if (collectionValueProfiles) {
    const result = validateCollectionValueProfiles({
      collectionValueProfiles,
      matchUpCount,
    });
    if (result.errors) {
      errors.push(...result.errors);
    }
  }

  if (collectionGroupNumber && typeof collectionGroupNumber !== 'number') {
    errors.push(`collectionGroupNumber is not type number: ${collectionValue}`);
  }

  if (matchUpFormat && !matchUpFormatCode.isValid(matchUpFormat)) {
    errors.push(`Invalid matchUpFormat: ${matchUpFormat}`);
  }

  if (checkGender) {
    const result = tieFormatGenderValidityCheck({
      referenceGender,
      matchUpType,
      gender,
    });

    if (result.error) {
      return decorateResult({
        context: { referenceGender, gender },
        result,
        stack,
      });
    }
  }

  if (checkCategory && referenceCategory && category) {
    const result = categoryCanContain({
      category: referenceCategory,
      childCategory: category,
    });
    if (!result.valid)
      return decorateResult({
        result: { error: INVALID_CATEGORY },
        context: result,
        stack,
      });
  }

  if (errors.length)
    return decorateResult({
      result: { errors, error: INVALID_COLLECTION_DEFINITION },
      stack,
    });

  return { valid: true };
}

type CheckTieFormatArgs = {
  tieFormat: TieFormat;
};
// add collectionIds if missing
export function checkTieFormat({
  tieFormat,
}: CheckTieFormatArgs): ResultType & { tieFormat?: TieFormat } {
  const result = validateTieFormat({
    checkCollectionIds: false,
    tieFormat,
  });
  if (result.error) return result;

  for (const collectionDefinition of tieFormat.collectionDefinitions) {
    if (!collectionDefinition.collectionId)
      collectionDefinition.collectionId = UUID();
  }

  return { tieFormat };
}

export function validateCollectionValueProfiles({
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
