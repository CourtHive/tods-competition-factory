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

  const setsParts = matchUpFormat.match(/-S(\d+)+:TB(\d+)@(\d*)([A-Za-z]*)/);
  const setsTo = setsParts?.[0];
  const tiebreakAt = setsParts?.[2];

  const finalSetParts = matchUpFormat.match(
    /-S(\d+)+:TB(\d+)@(\d*)([A-Za-z]*)/
  );
  const finalSetTo = finalSetParts?.[0];
  const finalTiebreakAt = finalSetParts?.[2];

  const preserveRedundant =
    (setsParts && setsTo === tiebreakAt) ||
    (finalSetParts && finalSetTo === finalTiebreakAt);

  return stringify(parsedFormat, preserveRedundant) === matchUpFormat;
}
