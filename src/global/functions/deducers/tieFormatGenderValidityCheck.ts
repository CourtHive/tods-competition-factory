import { ResultType, decorateResult } from '../decorateResult';

import { INVALID_GENDER } from '../../../constants/errorConditionConstants';
import { GenderEnum, TypeEnum } from '../../../types/tournamentFromSchema';
import { ANY, MIXED } from '../../../constants/genderConstants';

type GenderValidityCheckArgs = {
  referenceGender?: GenderEnum;
  matchUpType?: string;
  gender?: GenderEnum;
};

export const mixedGenderError =
  'MIXED events can not contain mixed singles or { gender: ANY } collections';
export const anyMixedError =
  'events with { gender: ANY } can not contain MIXED singles collections';

export function tieFormatGenderValidityCheck(
  params: GenderValidityCheckArgs
): ResultType {
  const stack = 'tieFormatGenderValidityCheck';
  const { referenceGender, matchUpType, gender } = params;
  if (
    referenceGender &&
    gender &&
    [GenderEnum.Male, GenderEnum.Female].includes(referenceGender) &&
    referenceGender !== gender
  )
    return decorateResult({
      result: { valid: false, error: INVALID_GENDER },
      context: { gender },
      stack,
    });

  if (
    referenceGender === MIXED &&
    (gender === ANY || (gender === MIXED && matchUpType !== TypeEnum.Doubles))
  ) {
    return decorateResult({
      result: { error: INVALID_GENDER, valid: false },
      info: mixedGenderError,
      stack,
    });
  }

  if (
    referenceGender === ANY &&
    gender === MIXED &&
    matchUpType !== TypeEnum.Doubles
  )
    return decorateResult({
      result: { error: INVALID_GENDER, valid: false },
      info: anyMixedError,
      stack,
    });

  return { valid: true };
}
