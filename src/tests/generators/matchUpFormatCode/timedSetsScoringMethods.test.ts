import { expect, it } from 'vitest';

import { parse } from '@Helpers/matchUpFormatCode/parse';
import { stringify } from '@Helpers/matchUpFormatCode/stringify';

it('can parse and stringify timed sets with scoring methods', () => {
  // Test aggregate scoring (A suffix)
  let result: any = parse('SET3X-S:T10A');
  expect(result.exactly).toEqual(3);
  expect(result.setFormat.timed).toEqual(true);
  expect(result.setFormat.minutes).toEqual(10);
  expect(result.setFormat.based).toEqual('A');
  expect(stringify(result)).toEqual('SET3X-S:T10A');

  // Test points-based scoring (P suffix)
  result = parse('SET3X-S:T10P');
  expect(result.exactly).toEqual(3);
  expect(result.setFormat.based).toEqual('P');
  expect(stringify(result)).toEqual('SET3X-S:T10P');

  // Test games-based scoring (G suffix explicit)
  result = parse('SET3X-S:T10G');
  expect(result.exactly).toEqual(3);
  expect(result.setFormat.based).toEqual('G');
  // G is default, so stringify omits it
  expect(stringify(result)).toEqual('SET3X-S:T10');

  // Test default (no suffix = games-based)
  result = parse('SET3X-S:T10');
  expect(result.exactly).toEqual(3);
  expect(result.setFormat.based).toBeUndefined(); // Default, no based set
  expect(stringify(result)).toEqual('SET3X-S:T10');

  // Test bestOf with aggregate
  result = parse('SET3-S:T10A');
  expect(result.bestOf).toEqual(3);
  expect(result.setFormat.based).toEqual('A');
  expect(stringify(result)).toEqual('SET3-S:T10A');
});

it('can parse and stringify timed sets with set-level tiebreak', () => {
  // Test points-based with TB1
  let result: any = parse('SET3-S:T10P/TB1');
  expect(result.bestOf).toEqual(3);
  expect(result.setFormat.based).toEqual('P');
  expect(result.setFormat.tiebreakFormat?.tiebreakTo).toEqual(1);
  expect(stringify(result)).toEqual('SET3-S:T10P/TB1');

  // Test games-based with TB1
  result = parse('SET3-S:T10G/TB1');
  expect(result.bestOf).toEqual(3);
  expect(result.setFormat.based).toEqual('G');
  expect(result.setFormat.tiebreakFormat?.tiebreakTo).toEqual(1);
  // G is default, so stringify omits it
  expect(stringify(result)).toEqual('SET3-S:T10/TB1');

  // Test aggregate with TB1 (though not common)
  result = parse('SET3X-S:T10A/TB1');
  expect(result.exactly).toEqual(3);
  expect(result.setFormat.based).toEqual('A');
  expect(result.setFormat.tiebreakFormat?.tiebreakTo).toEqual(1);
  expect(stringify(result)).toEqual('SET3X-S:T10A/TB1');

  // Test default with TB1
  result = parse('SET3-S:T10/TB1');
  expect(result.bestOf).toEqual(3);
  expect(result.setFormat.based).toBeUndefined();
  expect(result.setFormat.tiebreakFormat?.tiebreakTo).toEqual(1);
  expect(stringify(result)).toEqual('SET3-S:T10/TB1');
});

it('can parse and stringify aggregate with final set TB1', () => {
  // Test aggregate with final set TB1
  const result: any = parse('SET3X-S:T10A-F:TB1');
  expect(result.exactly).toEqual(3);
  expect(result.setFormat.based).toEqual('A');
  expect(result.finalSetFormat?.tiebreakSet?.tiebreakTo).toEqual(1);
  expect(stringify(result)).toEqual('SET3X-S:T10A-F:TB1');
});

it('can handle simplified timed format', () => {
  // Test simplified (single set) format
  let result: any = parse('T30A');
  expect(result.bestOf).toEqual(1);
  expect(result.simplified).toEqual(true);
  expect(result.setFormat.timed).toEqual(true);
  expect(result.setFormat.minutes).toEqual(30);
  expect(result.setFormat.based).toEqual('A');
  expect(stringify(result)).toEqual('T30A');

  // Test simplified with default (games)
  result = parse('T20');
  expect(result.bestOf).toEqual(1);
  expect(result.setFormat.based).toBeUndefined();
  expect(stringify(result)).toEqual('T20');

  // Test simplified with points
  result = parse('T15P');
  expect(result.bestOf).toEqual(1);
  expect(result.setFormat.based).toEqual('P');
  expect(stringify(result)).toEqual('T15P');
});

it('preserves special case: SET1 and SET1X both map to bestOf 1', () => {
  // SET1X should map to bestOf: 1 (special case)
  let result: any = parse('SET1X-S:T10A');
  expect(result.bestOf).toEqual(1);
  expect(result.exactly).toBeUndefined();
  expect(stringify(result)).toEqual('SET1-S:T10A'); // Stringifies as SET1, not SET1X

  // SET1 regular case
  result = parse('SET1-S:T10A');
  expect(result.bestOf).toEqual(1);
  expect(result.exactly).toBeUndefined();
  expect(stringify(result)).toEqual('SET1-S:T10A');
});

it('handles various tiebreak numbers at set level', () => {
  // TB1 (single point)
  let result: any = parse('SET3-S:T10P/TB1');
  expect(result.setFormat.tiebreakFormat?.tiebreakTo).toEqual(1);

  // TB7 (standard tiebreak)
  result = parse('SET3-S:T10P/TB7');
  expect(result.setFormat.tiebreakFormat?.tiebreakTo).toEqual(7);

  // TB10 (match tiebreak)
  result = parse('SET3-S:T10P/TB10');
  expect(result.setFormat.tiebreakFormat?.tiebreakTo).toEqual(10);
});

it('supports traditional game format -G:TN', () => {
  const format = 'SET3-S:T10-G:TN';
  const parsed: any = parse(format);
  expect(parsed.bestOf).toEqual(3);
  expect(parsed.setFormat.timed).toEqual(true);
  expect(parsed.setFormat.minutes).toEqual(10);
  expect(parsed.gameFormat).toEqual({ type: 'TRADITIONAL' });
  expect(stringify(parsed)).toEqual(format);
});

it('supports INTENNSE match-level aggregate (SET7XA-S:T10P)', () => {
  const format = 'SET7XA-S:T10P';
  const parsed: any = parse(format);
  expect(parsed.exactly).toEqual(7);
  expect(parsed.aggregate).toEqual(true);
  expect(parsed.setFormat.timed).toEqual(true);
  expect(parsed.setFormat.minutes).toEqual(10);
  expect(parsed.setFormat.based).toEqual('P');
  expect(stringify(parsed)).toEqual(format);
});

it('round-trips all variations correctly', () => {
  const formats = [
    'SET3X-S:T10A',
    'SET3X-S:T10P',
    'SET3X-S:T10',
    'SET3-S:T10A',
    'SET3-S:T10P/TB1',
    'SET3-S:T10/TB1',
    'SET3X-S:T10A-F:TB1',
    'SET2X-S:T20A-F:TB1',
    'T30A',
    'T20',
    'T15P',
    'SET5-S:T10P/TB1',
    // New multi-root and game format variations
    'SET7XA-S:T10P',
    'SET3-S:T10-G:TN',
    'SET5-S:5-G:3C',
    'HAL2A-S:T45',
    'QTR4A-S:T10',
  ];

  formats.forEach((format) => {
    const parsed: any = parse(format);
    const stringified = stringify(parsed);
    // Re-parse to ensure it's stable
    const reparsed: any = parse(stringified as any);
    expect(stringify(reparsed)).toEqual(stringified);
  });
});
