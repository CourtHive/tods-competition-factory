import { isConvertableInteger } from '../../utilities/math';
import { ensureInt } from '../../utilities/ensureInt';

export function getNumericSeedValue(seedValue) {
  if (!seedValue) return undefined;
  if (isConvertableInteger(seedValue)) return ensureInt(seedValue);
  const firstValue = seedValue.split('-')[0];
  if (isConvertableInteger(firstValue)) return ensureInt(firstValue);
  return undefined;
}
