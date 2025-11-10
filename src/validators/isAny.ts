import { ANY, ANY_ABBR } from '@Constants/genderConstants';

export function isAny(gender: any): boolean {
  return [ANY, ANY_ABBR].includes(gender);
}
