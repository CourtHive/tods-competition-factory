import * as matchUpFormatCode from '@Assemblies/governors/matchUpFormatGovernor';
import { isValidMatchUpFormat } from '@Validators/isValidMatchUpFormat';
import { expect, it } from 'vitest';

import { FORMAT_STANDARD } from '@Fixtures/scoring/matchUpFormats';

const standard = FORMAT_STANDARD;
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
    format: 'T120P',
    obj: {
      setFormat: { timed: true, based: 'P', minutes: 120 },
      simplified: true,
      bestOf: 1,
    },
  },
  {
    format: 'T120G',
    obj: {
      setFormat: { timed: true, based: 'G', minutes: 120 },
      simplified: true,
      bestOf: 1,
    },
  },
  {
    format: 'T120',
    obj: {
      setFormat: { timed: true, minutes: 120 },
      simplified: true,
      bestOf: 1,
    },
  },
  {
    format: 'T90',
    obj: {
      setFormat: { timed: true, minutes: 90 },
      simplified: true,
      bestOf: 1,
    },
  },
  {
    format: 'T60',
    obj: {
      setFormat: { timed: true, minutes: 60 },
      simplified: true,
      bestOf: 1,
    },
  },
  {
    format: 'T30',
    obj: {
      setFormat: { timed: true, minutes: 30 },
      simplified: true,
      bestOf: 1,
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
    const valid = matchUpFormatCode.isValidMatchUpFormat({
      matchUpFormat: validFormat.format,
    });
    expect(valid).toEqual(true);
  });
});

it('recognizes invalid formats', () => {
  invalidFormats.forEach((matchUpFormat) => {
    const valid = matchUpFormatCode.isValidMatchUpFormat({
      matchUpFormat: matchUpFormat,
    });
    expect(valid).toEqual(false);
  });
});

it('recognizes valid timed formats', () => {
  singleSetTimed.forEach(({ format }) => {
    const parsed = matchUpFormatCode.parse(format);
    const stringified = matchUpFormatCode.stringify(format);
    const valid = matchUpFormatCode.isValidMatchUpFormat({
      matchUpFormat: format,
    });
    if (!valid) console.log({ format, parsed, stringified });
    expect(valid).toEqual(true);
  });
});

it('match format suite', () => {
  // round trip conversion tests
  validFormats.forEach((sf) => {
    const parsed = matchUpFormatCode.parse(sf.format);
    const stringified = matchUpFormatCode.stringify(parsed);
    expect(stringified).toEqual(sf.format);
  });

  // return expected objects
  validFormats.forEach((sf) => sf.obj && expect(matchUpFormatCode.parse(sf.format)).toMatchObject(sf.obj));

  singleSetTimed.forEach((sf) => expect(matchUpFormatCode.parse(sf.format)).toEqual(sf.obj));

  // recognize invalid formats and return undefined
  invalidFormats.forEach((sf) => {
    const parsedFormat = matchUpFormatCode.parse(sf);
    expect(parsedFormat).toEqual(undefined);
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
  expect(isValidMatchUpFormat({ matchUpFormat: 'SET3-S:6/TB7@6' })).toEqual(true);
  expect(isValidMatchUpFormat({ matchUpFormat: standard })).toEqual(true);
});

it('supports matchUpFormatCode timed annotations', () => {
  const format = 'T30P';
  const parsed = matchUpFormatCode.parse(format);
  const stringified = matchUpFormatCode.stringify(parsed);
  expect(stringified).toEqual(format);
  const valid = matchUpFormatCode.isValidMatchUpFormat({
    matchUpFormat: format,
  });
  expect(valid).toEqual(true);
});

it('supports simplified matchUpFormatCode timed sets', () => {
  const format = 'T120';
  const parsed = matchUpFormatCode.parse(format);
  const stringified = matchUpFormatCode.stringify(parsed);
  expect(stringified).toEqual(format);

  const valid = matchUpFormatCode.isValidMatchUpFormat({
    matchUpFormat: format,
  });
  expect(valid).toEqual(true);
});

it('supports modifiers for timed sets', () => {
  const format = 'T90@RALLY';
  const parsed = matchUpFormatCode.parse(format);
  const stringified = matchUpFormatCode.stringify(parsed);
  expect(stringified).toEqual(format);
  const valid = matchUpFormatCode.isValidMatchUpFormat({
    matchUpFormat: format,
  });
  expect(valid).toEqual(true);
});

it('supports an even number of timed sets', () => {
  const format = 'SET4X-S:T10P';
  const parsed = matchUpFormatCode.parse(format);
  expect(parsed).toEqual({
    setFormat: { timed: true, minutes: 10, based: 'P' },
    exactly: 4,
  });
  const stringified = matchUpFormatCode.stringify(parsed);
  expect(stringified).toEqual(format);

  const withFinalSetFormat = 'SET4X-S:T10P-F:T5P';
  const finalSetParsed = matchUpFormatCode.parse(withFinalSetFormat);
  expect(finalSetParsed).toEqual({
    finalSetFormat: { timed: true, minutes: 5, based: 'P' },
    setFormat: { timed: true, minutes: 10, based: 'P' },
    exactly: 4,
  });
  const stringifiedWithFinalSet = matchUpFormatCode.stringify(finalSetParsed);
  expect(stringifiedWithFinalSet).toEqual(withFinalSetFormat);
});

it('accepts odd bestOf and rejects even non-timed sets without X suffix', () => {
  const format = 'SET4-S:6';
  const parsed = matchUpFormatCode.parse(format);
  expect(parsed).toEqual({ bestOf: 4, setFormat: { setTo: 6, noTiebreak: true } });
  
  const format2 = 'SET4X-S:6';
  const parsed2 = matchUpFormatCode.parse(format2);
  expect(parsed2).toBeUndefined();
});

it('can parse and stringify "exactly" with X suffix for timed sets', () => {
  const format1 = 'SET3X-S:T10';
  const parsed1 = matchUpFormatCode.parse(format1);
  expect(parsed1).toEqual({ exactly: 3, setFormat: { timed: true, minutes: 10 } });
  const stringified1 = matchUpFormatCode.stringify(parsed1);
  expect(stringified1).toEqual(format1);

  const format2 = 'SET2X-S:T20';
  const parsed2 = matchUpFormatCode.parse(format2);
  expect(parsed2).toEqual({ exactly: 2, setFormat: { timed: true, minutes: 20 } });
  const stringified2 = matchUpFormatCode.stringify(parsed2);
  expect(stringified2).toEqual(format2);

  const format3 = 'SET3-S:6/TB7';
  const parsed3 = matchUpFormatCode.parse(format3);
  expect(parsed3).toEqual({ bestOf: 3, setFormat: { setTo: 6, tiebreakAt: 6, tiebreakFormat: { tiebreakTo: 7 } } });
  const stringified3 = matchUpFormatCode.stringify(parsed3);
  expect(stringified3).toEqual(format3);
});

it('treats SET1 and SET1X as equivalent (both use bestOf: 1)', () => {
  // Parse SET1 → bestOf: 1
  const format1 = 'SET1-S:T10';
  const parsed1 = matchUpFormatCode.parse(format1);
  expect(parsed1).toEqual({ bestOf: 1, setFormat: { timed: true, minutes: 10 } });
  const stringified1 = matchUpFormatCode.stringify(parsed1);
  expect(stringified1).toEqual(format1);

  // Parse SET1X → bestOf: 1 (not exactly: 1)
  const format2 = 'SET1X-S:T10';
  const parsed2 = matchUpFormatCode.parse(format2);
  expect(parsed2).toEqual({ bestOf: 1, setFormat: { timed: true, minutes: 10 } });
  const stringified2 = matchUpFormatCode.stringify(parsed2);
  expect(stringified2).toEqual('SET1-S:T10'); // Stringifies as SET1, not SET1X

  // Stringify { exactly: 1 } → SET1 (not SET1X)
  const parsed3 = { exactly: 1, setFormat: { timed: true, minutes: 15 } };
  const stringified3 = matchUpFormatCode.stringify(parsed3);
  expect(stringified3).toEqual('SET1-S:T15'); // No X suffix
});
