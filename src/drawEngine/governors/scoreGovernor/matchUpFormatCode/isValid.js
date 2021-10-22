import { stringify } from './stringify';
import { parse } from './parse';

export function isValid(matchUpFormat) {
  if (typeof matchUpFormat !== 'string') return false;
  const parsedFormat = parse(matchUpFormat);
  if (
    parsedFormat?.setFormat?.timed &&
    parsedFormat?.bestOf === 1 &&
    matchUpFormat.indexOf('SET1-S:') < 1 &&
    matchUpFormat.indexOf('T') === 0
  ) {
    return stringify(parsedFormat).slice(7) === matchUpFormat;
  }
  return stringify(parsedFormat) === matchUpFormat;
}
