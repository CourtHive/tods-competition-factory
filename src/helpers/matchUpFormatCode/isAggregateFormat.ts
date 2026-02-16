/**
 * Determines if a parsed matchUpFormat represents aggregate scoring.
 *
 * Aggregate scoring can be signaled in three ways:
 * 1. parsed.aggregate === true  (match-level A modifier, e.g. SET7XA-S:T10P)
 * 2. parsed.setFormat?.based === 'A' or parsed.finalSetFormat?.based === 'A'
 * 3. parsed.gameFormat?.type === 'AGGR'
 */
export function isAggregateFormat(parsed: any): boolean {
  return !!(
    parsed?.aggregate ||
    parsed?.setFormat?.based === 'A' ||
    parsed?.finalSetFormat?.based === 'A' ||
    parsed?.gameFormat?.type === 'AGGR'
  );
}
