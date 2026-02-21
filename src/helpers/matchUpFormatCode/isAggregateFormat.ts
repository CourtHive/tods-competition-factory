/**
 * Determines if a parsed matchUpFormat represents aggregate scoring.
 *
 * Aggregate scoring can be signaled in two ways:
 * 1. parsed.aggregate === true  (match-level A modifier, e.g. SET7XA-S:T10P)
 * 2. parsed.setFormat?.based === 'A' or parsed.finalSetFormat?.based === 'A'
 */
export function isAggregateFormat(parsed: any): boolean {
  return !!(
    parsed?.aggregate ||
    parsed?.setFormat?.based === 'A' ||
    parsed?.finalSetFormat?.based === 'A'
  );
}
