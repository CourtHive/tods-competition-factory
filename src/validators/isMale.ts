import { MALE, MALE_ABBR } from '@Constants/genderConstants';

export function isMale(gender: any): boolean {
  return [MALE, MALE_ABBR].includes(gender);
}
