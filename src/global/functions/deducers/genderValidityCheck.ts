import { GenderEnum, TypeEnum } from '../../../types/tournamentFromSchema';
import { ResultType, decorateResult } from '../decorateResult';
import { ANY, MIXED } from '../../../constants/genderConstants';

import { INVALID_GENDER } from '../../../constants/errorConditionConstants';

type GenderValidityCheckArgs = {
  referenceGender?: GenderEnum;
  matchUpType?: string;
  gender?: GenderEnum;
};

export function genderValidityCheck({
  referenceGender,
  matchUpType,
  gender,
}: GenderValidityCheckArgs): ResultType {
  const stack = 'genderValidityCheck';
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

  if (referenceGender === MIXED) {
    if (
      gender === ANY ||
      (gender === MIXED && matchUpType !== TypeEnum.Doubles)
    )
      return decorateResult({
        info: 'MIXED events can not contain mixed singles or coed collections',
        result: { error: INVALID_GENDER, valid: false },
        stack,
      });
  }

  if (
    referenceGender === ANY &&
    gender === MIXED &&
    matchUpType !== TypeEnum.Doubles
  )
    return decorateResult({
      info: 'COED events can not contain MIXED singles collections',
      result: { error: INVALID_GENDER, valid: false },
      stack,
    });

  return { valid: true };
}
