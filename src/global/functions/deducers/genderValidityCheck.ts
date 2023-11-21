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
    [GenderEnum.Male, GenderEnum.Female].includes(referenceGender)
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

  if (
    referenceGender === MIXED &&
    (gender !== MIXED || matchUpType === TypeEnum.Singles)
  )
    return decorateResult({
      info: 'MIXED events can only contain MIXED doubles collections',
      result: { error: INVALID_GENDER, valid: false },
      stack,
    });

  return { valid: true };
}
