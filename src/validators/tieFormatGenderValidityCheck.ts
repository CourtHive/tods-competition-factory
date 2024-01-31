import { decorateResult } from '@Functions/global/decorateResult';

// constants and types
import { INVALID_GENDER } from '@Constants/errorConditionConstants';
import { ANY, FEMALE, MALE, MIXED } from '@Constants/genderConstants';
import { GenderUnion } from '@Types/tournamentTypes';
import { DOUBLES } from '@Constants/matchUpTypes';
import { ResultType } from '@Types/factoryTypes';

type GenderValidityCheckArgs = {
  referenceGender?: GenderUnion;
  matchUpType?: string;
  gender?: GenderUnion;
};

export const mixedGenderError = 'MIXED events can not contain mixed singles or { gender: ANY } collections';
export const anyMixedError = 'events with { gender: ANY } can not contain MIXED singles collections';

export function tieFormatGenderValidityCheck(params: GenderValidityCheckArgs): ResultType {
  const stack = 'tieFormatGenderValidityCheck';
  const { referenceGender, matchUpType, gender } = params;
  if (referenceGender && gender && [MALE, FEMALE].includes(referenceGender) && referenceGender !== gender)
    return decorateResult({
      result: { valid: false, error: INVALID_GENDER },
      context: { gender },
      stack,
    });

  if (referenceGender === MIXED && (gender === ANY || (gender === MIXED && matchUpType !== DOUBLES))) {
    return decorateResult({
      result: { error: INVALID_GENDER, valid: false },
      info: mixedGenderError,
      stack,
    });
  }

  if (referenceGender === ANY && gender === MIXED && matchUpType !== DOUBLES)
    return decorateResult({
      result: { error: INVALID_GENDER, valid: false },
      info: anyMixedError,
      stack,
    });

  return { valid: true };
}
