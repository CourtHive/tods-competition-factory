import { isConvertableInteger } from '../../tools/math';
import { ensureInt } from '../../tools/ensureInt';

export function getNumericSeedValue(seedValue) {
  if (!seedValue) return Infinity;
  if (isConvertableInteger(seedValue)) return ensureInt(seedValue);
  const firstValue = seedValue.split('-')[0];
  if (isConvertableInteger(firstValue)) return ensureInt(firstValue);
  return Infinity;
}
