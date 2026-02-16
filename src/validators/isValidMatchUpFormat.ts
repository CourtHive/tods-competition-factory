import { stringify } from '@Helpers/matchUpFormatCode/stringify';
import { parse } from '@Helpers/matchUpFormatCode/parse';
import { isString } from '@Tools/objects';

// Strip only timed-basis G suffix (T10G -> T10), not -G: section keys
function normalizeTimedBasisG(s: string): string {
  return s.replaceAll(/T(\d+)G(?=\/TB|@|-|$)/g, 'T$1');
}

export function isValidMatchUpFormat({ matchUpFormat }: { matchUpFormat: string }): boolean {
  if (!isString(matchUpFormat) || matchUpFormat === '') return false;
  const parsedFormat = parse(matchUpFormat);

  const setParts = /-S:(\d+)\/TB(\d{1,2})@?(\d?)/.exec(matchUpFormat);
  const setsTo = setParts?.[1];
  const tiebreakTo = setParts?.[2];
  const tiebreakAt = setParts?.[3];

  const finalSetParts = /-F:(\d+)\/TB(\d{1,2})@?(\d?)/.exec(matchUpFormat);
  const finalSetTo = finalSetParts?.[1];
  const finalSetTiebreakTo = finalSetParts?.[2];
  const finalTiebreakAt = finalSetParts?.[3];

  const preserveRedundant = !!(
    (setParts && tiebreakTo && setsTo === tiebreakAt) ||
    (finalSetParts && finalSetTiebreakTo && finalSetTo === finalTiebreakAt)
  );

  const stringified = stringify(parsedFormat, preserveRedundant);

  // matchUpFormat is valid if parsing and then stringifying returns the original format
  // normalizeTimedBasisG strips only timed-basis G suffix (e.g. T10G -> T10), not -G: section keys
  return stringified === normalizeTimedBasisG(matchUpFormat);
}
