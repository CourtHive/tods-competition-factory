import { stringify } from './stringify';
import { parse } from './parse';

export function isValid(matchUpFormat: string): boolean {
  if (typeof matchUpFormat !== 'string') return false;
  const parsedFormat = parse(matchUpFormat);

  const setParts = matchUpFormat.match(
    /-S:([1-9])+\/TB([0-9]{1,2})@?([1-9]?)*/
  );
  const setsTo = setParts?.[1];
  const tiebreakTo = setParts?.[2];
  const tiebreakAt = setParts?.[3];

  const finalSetParts = matchUpFormat.match(
    /-F:([1-9])+\/TB([0-9]{1,2})@?([1-9]?)*/
  );
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
