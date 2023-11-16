import { GenderEnum, TypeEnum } from '../../../types/tournamentFromSchema';
import { ResultType, decorateResult } from '../decorateResult';
import { MIXED } from '../../../constants/genderConstants';

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
    [GenderEnum.Male, GenderEnum.Female].includes(gender)
  ) {
    const valid = gender === referenceGender;
    return valid
      ? { valid: true }
      : decorateResult({
          result: { valid: false, error: INVALID_GENDER },
          context: { gender },
          stack,
        });
  }
  if (matchUpType === TypeEnum.Singles && referenceGender === MIXED)
    return decorateResult({
      info: 'matchUpType SINGLES is invalid for gender MIXED',
      result: { error: INVALID_GENDER, valid: false },
      stack,
    });

  return { valid: true };
}
