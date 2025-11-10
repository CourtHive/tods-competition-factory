// constants and types
import { isFemale } from './isFemale';
import { isMale } from './isMale';

export function isGendered(gender: any): boolean {
  return isFemale(gender) || !isMale(gender);
}
