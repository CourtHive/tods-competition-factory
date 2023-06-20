import { matchUpFormatCode } from '..';
import { isValid } from '../isValid';
import { expect, it } from 'vitest';

const standard = 'SET3-S:6/TB7';
const validFormats = [
  {
    name: 'Standard Match',
    format: standard,
    obj: {
      bestOf: 3,
      setFormat: { setTo: 6, tiebreakAt: 6, tiebreakFormat: { tiebreakTo: 7 } },
    },
  },
  {
    name: 'Short Sets',
    format: 'SET3-S:4/TB7',
    obj: {
      bestOf: 3,
      setFormat: { setTo: 4, tiebreakAt: 4, tiebreakFormat: { tiebreakTo: 7 } },
    },
  },
  {
    name: 'Fast 4',
    format: 'SET3-S:4/TB5@3',
    obj: {
      bestOf: 3,
      setFormat: { setTo: 4, tiebreakAt: 3, tiebreakFormat: { tiebreakTo: 5 } },
    },
  },
  {
    name: 'Wimbledon Singles 1971',
    format: 'SET5-S:6/TB9-F:6',
    obj: {
      bestOf: 5,
      setFormat: { setTo: 6, tiebreakAt: 6, tiebreakFormat: { tiebreakTo: 9 } },
      finalSetFormat: { setTo: 6, noTiebreak: true },
    },
  },
  {
    name: 'Wimbledon Singles 2018',
    format: 'SET5-S:6/TB7-F:6',
    obj: {
      bestOf: 5,
      setFormat: { setTo: 6, tiebreakAt: 6, tiebreakFormat: { tiebreakTo: 7 } },
      finalSetFormat: { setTo: 6, noTiebreak: true },
    },
  },
  {
    name: 'Wimbledon Singles 2019',
    format: 'SET5-S:6/TB7-F:6/TB7@12',
    obj: {
      bestOf: 5,
      setFormat: { setTo: 6, tiebreakAt: 6, tiebreakFormat: { tiebreakTo: 7 } },
      finalSetFormat: {
        setTo: 6,
        tiebreakAt: 12,
        tiebreakFormat: { tiebreakTo: 7 },
      },
    },
  },
  {
    name: 'Australian Open Singles from 2019',
    format: 'SET5-S:6/TB7-F:6/TB10',
    obj: {
      bestOf: 5,
      setFormat: { setTo: 6, tiebreakAt: 6, tiebreakFormat: { tiebreakTo: 7 } },
      finalSetFormat: {
        setTo: 6,
        tiebreakAt: 6,
        tiebreakFormat: { tiebreakTo: 10 },
      },
    },
  },
  {
    name: 'World Team Tennis',
    format: 'SET5-S:5NOAD/TB9NOAD@4',
    obj: {
      bestOf: 5,
      setFormat: {
        setTo: 5,
        NoAD: true,
        tiebreakAt: 4,
        tiebreakFormat: { tiebreakTo: 9, NoAD: true },
      },
    },
  },
  {
    name: 'Tiebreak Only Match',
    format: 'SET3-S:TB10',
    obj: {
      bestOf: 3,
      setFormat: { tiebreakSet: { tiebreakTo: 10 } },
    },
  },
  {
    name: 'ATP Doubles',
    format: 'SET3-S:6/TB7-F:TB10',
    obj: {
      bestOf: 3,
      setFormat: { setTo: 6, tiebreakAt: 6, tiebreakFormat: { tiebreakTo: 7 } },
      finalSetFormat: { tiebreakSet: { tiebreakTo: 10 } },
    },
  },
  {
    name: 'Pro Set',
    format: 'SET1-S:8/TB7',
    obj: {
      bestOf: 1,
      setFormat: { setTo: 8, tiebreakAt: 8, tiebreakFormat: { tiebreakTo: 7 } },
    },
  },
  {
    name: 'College Pro Set',
    format: 'SET1-S:8/TB7@7',
    obj: {
      bestOf: 1,
      setFormat: { setTo: 8, tiebreakAt: 7, tiebreakFormat: { tiebreakTo: 7 } },
    },
  },
  {
    name: '3 timed sets',
    format: 'SET3-S:T20-F:T60',
    obj: {
      bestOf: 3,
      setFormat: { timed: true, minutes: 20 },
      finalSetFormat: { timed: true, minutes: 60 },
    },
  },
  {
    format: 'SET1-S:T120',
    obj: {
      bestOf: 1,
      setFormat: { timed: true, minutes: 120 },
    },
  },
  {
    format: 'SET1-S:T90',
    obj: {
      bestOf: 1,
      setFormat: { timed: true, minutes: 90 },
    },
  },
  {
    format: 'SET1-S:T60',
    obj: {
      bestOf: 1,
      setFormat: { timed: true, minutes: 60 },
    },
  },
  {
    format: 'SET1-S:T30',
    obj: {
      bestOf: 1,
      setFormat: { timed: true, minutes: 30 },
    },
  },
];

const singleSetTimed = [
  {
    format: 'T120',
    obj: {
      bestOf: 1,
      setFormat: { timed: true, minutes: 120 },
    },
  },
  {
    format: 'T90',
    obj: {
      bestOf: 1,
      setFormat: { timed: true, minutes: 90 },
    },
  },
  {
    format: 'T60',
    obj: {
      bestOf: 1,
      setFormat: { timed: true, minutes: 60 },
    },
  },
  {
    format: 'T30',
    obj: {
      bestOf: 1,
      setFormat: { timed: true, minutes: 30 },
    },
  },
];

const invalidFormats = [
  '',
  'T',
  '90',
  'T90X',
  'T90@',
  'SET3-S:6/TB',
  'SET3-S:6/TB7@',
  'SET5-S:6/T9-F:6',
  'SET-S:6/TB7-F:6',
  'SET35-S:6/TB7-F:TB10',
  'SET5-S:6/TB7-X:6/TB10',
  'SET5-S:5NOAD/TB9NOD@4',
  'SET5-S:5NAD/TB9NOAD@4',
  'SET5-S:6/TB7F:6/TB7@12',
];

it('recognizes valid formats', () => {
  validFormats.forEach((validFormat) => {
    const valid = matchUpFormatCode.isValid(validFormat.format);
    expect(valid).toEqual(true);
  });
});

it('recognizes invalid formats', () => {
  invalidFormats.forEach((matchUpFormat) => {
    const valid = matchUpFormatCode.isValid(matchUpFormat);
    expect(valid).toEqual(false);
  });
});

it('recognizes valid timed formats', () => {
  singleSetTimed.forEach(({ format }) => {
    const valid = matchUpFormatCode.isValid(format);
    expect(valid).toEqual(true);
  });
});

it('match format suite', () => {
  // round trip conversion tests
  validFormats.forEach((sf) => {
    expect(
      matchUpFormatCode.stringify(matchUpFormatCode.parse(sf.format))
    ).toEqual(sf.format);
  });

  // return expected objects
  validFormats.forEach((sf) => {
    if (sf.obj)
      expect(matchUpFormatCode.parse(sf.format)).toMatchObject(sf.obj);
  });

  singleSetTimed.forEach((sf) => {
    expect(matchUpFormatCode.parse(sf.format)).toEqual(sf.obj);
  });

  // recognize invalid formats and return undefined
  invalidFormats.forEach((sf) => {
    expect(matchUpFormatCode.parse(sf)).toEqual(undefined);
  });
});

it('handles tiebreakAt: false and tiebreakFormat/tiebreakTo: false', () => {
  const testFormat = {
    bestOf: 3,
    finalSetFormat: {
      noTiebreak: true,
      setTo: 6,
      tiebreakAt: false,
      tiebreakFormat: { tiebreakTo: false },
    },
    setFormat: {
      noTiebreak: true,
      setTo: 6,
      tiebreakAt: 6,
      tiebreakFormat: { tiebreakTo: false },
    },
  };

  const result = matchUpFormatCode.stringify(testFormat);
  expect(result).toEqual('SET3-S:6');
});

it('parse and stringify format for multiple timed sets', () => {
  const scoreFormat = {
    format: 'SET3-S:T20-F:T60',
    obj: {
      bestOf: 3,
      setFormat: { timed: true, minutes: 20 },
      finalSetFormat: { timed: true, minutes: 60 },
    },
  };
  const parsed = matchUpFormatCode.parse(scoreFormat.format);
  expect(parsed).toMatchObject(scoreFormat.obj);

  const stringified = matchUpFormatCode.stringify(scoreFormat.obj);
  expect(stringified).toEqual(scoreFormat.format);
});

it('will not include final set code when equivalent to other sets', () => {
  const obj = {
    bestOf: 3,
    setFormat: { setTo: 6, tiebreakAt: 6, tiebreakFormat: { tiebreakTo: 7 } },
    finalSetFormat: {
      setTo: 6,
      tiebreakAt: 6,
      tiebreakFormat: { tiebreakTo: 7 },
    },
  };
  expect(matchUpFormatCode.stringify(obj)).toEqual(standard);
});

it('can preserve redundant tiebreakAt detail', () => {
  expect(isValid('SET3-S:6/TB7@6')).toEqual(true);
  expect(isValid(standard)).toEqual(true);
});
