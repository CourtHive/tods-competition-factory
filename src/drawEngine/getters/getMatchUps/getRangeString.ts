import { isNumeric } from '../../../utilities/math';
import { unique } from '../../../utilities';

export function getRangeString(arr) {
  if (!Array.isArray(arr)) return '';
  const numericArray = arr.filter(isNumeric);
  if (!numericArray.length) return '';
  const range = unique([Math.min(...numericArray), Math.max(...numericArray)]);
  return range.join('-');
}
