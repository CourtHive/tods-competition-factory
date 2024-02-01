import { isNumeric } from '@Tools/math';

export function simpleAddition(a, b) {
  return ((isNumeric(a) && a) || 0) + ((isNumeric(b) && b) || 0);
}
