import { isConvertableInteger } from '../../utilities/math';

export function getNumericSeedValue(seedValue) {
  if (!seedValue) return undefined;
  if (isConvertableInteger(seedValue)) return parseInt(seedValue);
  const firstValue = seedValue.split('-')[0];
  if (isConvertableInteger(firstValue)) return parseInt(firstValue);
  return undefined;
}
