import { tieFormatGenderValidityCheck } from '../global/functions/deducers/tieFormatGenderValidityCheck';
import { categoryCanContain } from '../global/functions/deducers/categoryCanContain';
import { matchUpFormatCode } from '../assemblies/governors/matchUpFormatGovernor';
import { validateCollectionValueProfiles } from './validateCollectionValueProfiles';
import { decorateResult } from '../global/functions/decorateResult';
import { isConvertableInteger } from '../utilities/math';

import { DOUBLES, SINGLES } from '../constants/matchUpTypes';
import {
  INVALID_CATEGORY,
  INVALID_COLLECTION_DEFINITION,
  INVALID_OBJECT,
} from '../constants/errorConditionConstants';
import {
  Category,
  CollectionDefinition,
  Event,
  EventTypeUnion,
  GenderUnion,
} from '../types/tournamentTypes';

type ValidateCollectionDefinitionArgs = {
  collectionDefinition: CollectionDefinition;
  referenceGender?: GenderUnion;
  referenceCategory?: Category;
  checkCollectionIds?: boolean;
  eventType?: EventTypeUnion;
  checkCategory?: boolean;
  checkGender?: boolean;
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
  if (matchUpType && ![SINGLES, DOUBLES].includes(matchUpType)) {
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
  if (collectionValueProfiles && matchUpCount) {
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

  if (matchUpFormat && !matchUpFormatCode.isValidMatchUpFormat(matchUpFormat)) {
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
