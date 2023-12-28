import { decorateResult, ResultType } from '../global/functions/decorateResult';
import { validateCollectionDefinition } from './validateCollectionDefinition';
import { mustBeAnArray } from '../utilities/mustBeAnArray';
import { unique } from '../utilities/arrays';

import { INVALID_TIE_FORMAT } from '../constants/errorConditionConstants';
import { Category, Event, GenderUnion } from '../types/tournamentTypes';

type ValidateTieFormatArgs = {
  checkCollectionIds?: boolean;
  enforceCategory?: boolean;
  enforceGender?: boolean;
  gender?: GenderUnion;
  category?: Category;
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
