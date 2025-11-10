import { FEMALE, FEMALE_ABBR } from '@Constants/genderConstants';

export function isFemale(gender: any): boolean {
  return [FEMALE, FEMALE_ABBR].includes(gender);
}
