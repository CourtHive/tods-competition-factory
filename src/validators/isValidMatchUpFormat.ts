import { stringify } from '@Helpers/matchUpFormatCode/stringify';
import { parse } from '@Helpers/matchUpFormatCode/parse';
import { isString } from '@Tools/objects';

export function isValidMatchUpFormat({ matchUpFormat }: { matchUpFormat: string }): boolean {
  if (!isString(matchUpFormat) || matchUpFormat === '') return false;
  const parsedFormat = parse(matchUpFormat);

  const setParts = /-S:([1-9])+\/TB(\d{1,2})@?([1-9]?)/.exec(matchUpFormat);
  const setsTo = setParts?.[1];
  const tiebreakTo = setParts?.[2];
  const tiebreakAt = setParts?.[3];

  const finalSetParts = /-F:([1-9])+\/TB(\d{1,2})@?([1-9]?)/.exec(matchUpFormat);
  const finalSetTo = finalSetParts?.[1];
  const finalSetTiebreakTo = finalSetParts?.[2];
  const finalTiebreakAt = finalSetParts?.[3];

  const preserveRedundant = !!(
    (setParts && tiebreakTo && setsTo === tiebreakAt) ||
    (finalSetParts && finalSetTiebreakTo && finalSetTo === finalTiebreakAt)
  );

  const stringified = stringify(parsedFormat, preserveRedundant);

  return stringified === matchUpFormat;
}
