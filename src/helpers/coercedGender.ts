import { isFemale } from '@Validators/isFemale';
import { isMale } from '@Validators/isMale';
import { isMixed } from '@Validators/isMixed';
import { isAny } from '@Validators/isAny';

// constants and types
import { ANY, FEMALE, MALE, MIXED, OTHER } from '@Constants/genderConstants';

export function coercedGender(gender: any): string | undefined {
  if (gender) {
    if (isFemale(gender)) return FEMALE;
    if (isMixed(gender)) return MIXED;
    if (isMale(gender)) return MALE;
    if (isAny(gender)) return ANY;
  }
  return OTHER;
}
