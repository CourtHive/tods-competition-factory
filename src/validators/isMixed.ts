import { MIXED, MIXED_ABBR } from '@Constants/genderConstants';

export function isMixed(gender: any): boolean {
  return [MIXED, MIXED_ABBR].includes(gender);
}
