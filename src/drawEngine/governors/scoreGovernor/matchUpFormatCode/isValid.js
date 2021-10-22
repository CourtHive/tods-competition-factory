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

  /*
  const setsParts = '-S6:TB7@6NOAD'.match(
    /-S(\d+)+:TB(\d+)[@]*(\d*)([A-Za-z]*)/
  );
  const [setsTo, tiebreakTo, tiebreakAt, NOAD] = setsParts.slice(1);

  const finalSetParts = '-F6:TB7@6NOAD'.match(
    /-S(\d+)+:TB(\d+)[@]*(\d*)([A-Za-z]*)/
  );
  const [finalSetTo, finalTiebreakTo, finalTiebreakAt, finalNOAD] =
    finalSetParts.slice(1);
  */

  return stringify(parsedFormat) === matchUpFormat;
}
