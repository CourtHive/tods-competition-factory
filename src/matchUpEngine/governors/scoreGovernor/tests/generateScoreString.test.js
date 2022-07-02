import { generateScoreString } from '../generateScoreString';

import { RETIRED } from '../../../../constants/matchUpStatusConstants';

test('can generate matchUp tiebreak string scores', () => {
  const sets = [
    { side1TiebreakScore: 10, side2TiebreakScore: 3 },
    { side1TiebreakScore: 1, side2TiebreakScore: 10 },
    { side1TiebreakScore: 3 },
  ];
  const result = generateScoreString({ sets, autoComplete: true });
  expect(result).toEqual('[10-3] [1-10] [3-0]');
});

test('can generate matchUp set scores when no tiebreak', () => {
  const sets = [
    { side1Score: 7, side2Score: 3 },
    { side1Score: 1, side2Score: 7 },
    { side1Score: 3 },
  ];
  const result = generateScoreString({ sets, autoComplete: true });
  expect(result).toEqual('7-3 1-7 3-0');
});

test('can generate matchUp set scores with set tiebreak', () => {
  const sets = [
    {
      side1Score: 6,
      side2Score: 7,
      side1TiebreakScore: 3,
      side2TiebreakScore: 7,
      winningSide: 2,
    },
    {
      side1Score: 7,
      side2Score: 6,
      side1TiebreakScore: 14,
      side2TiebreakScore: 12,
      winningSide: 1,
    },
    { side1Score: 3 },
  ];
  let result = generateScoreString({ sets, autoComplete: true });
  expect(result).toEqual('6-7(3) 7-6(12) 3-0');

  result = generateScoreString({ sets, autoComplete: true, reversed: true });
  expect(result).toEqual('7-6(3) 6-7(12) 0-3');
});

test('can append a scoreString outcome', () => {
  const sets = [
    {
      side1Score: 6,
      side2Score: 7,
      side1TiebreakScore: 3,
      side2TiebreakScore: 7,
      winningSide: 2,
    },
    {
      side1Score: 7,
      side2Score: 6,
      side1TiebreakScore: 14,
      side2TiebreakScore: 12,
      winningSide: 1,
    },
    { side1Score: 3 },
  ];
  let result = generateScoreString({
    sets,
    winningSide: 1,
    autoComplete: true,
    matchUpStatus: RETIRED,
    addOutcomeString: true,
  });
  expect(result).toEqual('6-7(3) 7-6(12) 3-0 RET');
  result = generateScoreString({
    sets,
    winningSide: 1,
    autoComplete: true,
    matchUpStatus: RETIRED,
    reversed: true,
    addOutcomeString: true,
  });
  expect(result).toEqual('7-6(3) 6-7(12) 0-3 RET');
});

test('can prepend a scoreString outcome', () => {
  const sets = [
    {
      side1Score: 6,
      side2Score: 7,
      side1TiebreakScore: 3,
      side2TiebreakScore: 7,
      winningSide: 2,
    },
    {
      side1Score: 7,
      side2Score: 6,
      side1TiebreakScore: 14,
      side2TiebreakScore: 12,
      winningSide: 1,
    },
    { side1Score: 3 },
  ];
  const result = generateScoreString({
    sets,
    winningSide: 2,
    autoComplete: true,
    matchUpStatus: RETIRED,
    addOutcomeString: true,
  });
  expect(result).toEqual('RET 7-6(3) 6-7(12) 0-3');
});

test('can generate with winningSide perspective', () => {
  const sets = [
    {
      side1Score: 6,
      side2Score: 7,
      side1TiebreakScore: 3,
      side2TiebreakScore: 7,
      winningSide: 2,
    },
    {
      side1Score: 6,
      side2Score: 7,
      side1TiebreakScore: 12,
      side2TiebreakScore: 14,
      winningSide: 2,
    },
  ];
  const result = generateScoreString({ sets, winningSide: 2 });
  expect(result).toEqual('7-6(3) 7-6(12)');
});

test('can ignore winningSide perspective', () => {
  const sets = [
    {
      side1Score: 6,
      side2Score: 7,
      side1TiebreakScore: 3,
      side2TiebreakScore: 7,
      winningSide: 2,
    },
    {
      side1Score: 6,
      side2Score: 7,
      side1TiebreakScore: 12,
      side2TiebreakScore: 14,
      winningSide: 2,
    },
  ];
  const result = generateScoreString({
    sets,
    winningSide: 2,
    winnerFirst: false,
  });
  expect(result).toEqual('6-7(3) 6-7(12)');
});

test('properly sorts set results', () => {
  const sets = [
    {
      setNumber: 2,
      side1Score: 6,
      side2Score: 7,
      side1TiebreakScore: 3,
      side2TiebreakScore: 7,
      winningSide: 2,
    },
    {
      setNumber: 1,
      side1Score: 7,
      side2Score: 6,
      side1TiebreakScore: 14,
      side2TiebreakScore: 12,
      winningSide: 1,
    },
    { side1Score: 3 },
  ];
  const result = generateScoreString({ sets, autoComplete: true });
  expect(result).toEqual('7-6(12) 6-7(3) 3-0');
});

test('generate incomplete scoreString string', () => {
  const sets = [
    {
      setNumber: 2,
      side1Score: 6,
      side2Score: 7,
      side1TiebreakScore: 3,
      side2TiebreakScore: 7,
      winningSide: 2,
    },
    {
      setNumber: 1,
      side1Score: 7,
      side2Score: 6,
      side1TiebreakScore: 14,
      side2TiebreakScore: 12,
      winningSide: 1,
    },
    { side1Score: 3 },
  ];
  const result = generateScoreString({ sets, autoComplete: false });
  expect(result).toEqual('7-6(12) 6-7(3) 3-');
});

it('returns empty string when no sets', () => {
  let sets = [];
  let result = generateScoreString({ sets, autoComplete: false });
  expect(result).toEqual('');

  sets = [
    {
      setNumber: 1,
      side1Score: undefined,
      side2Score: undefined,
      side1TiebreakScore: undefined,
      side2TiebreakScore: undefined,
    },
  ];

  result = generateScoreString({ sets, autoComplete: false });
  expect(result).toEqual('');

  sets = [
    {
      setNumber: 1,
      side1Score: '',
      side2Score: '',
      side1TiebreakScore: '',
      side2TiebreakScore: '',
    },
  ];

  result = generateScoreString({ sets, autoComplete: false });
  expect(result).toEqual('');

  sets = [
    {
      setNumber: 1,
      side1Score: undefined,
      side2Score: undefined,
      side1TiebreakScore: undefined,
      side2TiebreakScore: undefined,
    },
    {
      setNumber: 2,
      side1Score: undefined,
      side2Score: undefined,
      side1TiebreakScore: undefined,
      side2TiebreakScore: undefined,
    },
  ];

  result = generateScoreString({ sets, autoComplete: false });
  expect(result).toEqual('');
});

it('handles zero', () => {
  let sets = [];
  let result = generateScoreString({ sets, autoComplete: false });
  expect(result).toEqual('');

  sets = [
    {
      setNumber: 1,
      side1Score: 0,
      side2Score: 6,
      side1TiebreakScore: undefined,
      side2TiebreakScore: undefined,
    },
  ];

  result = generateScoreString({ sets, autoComplete: false });
  expect(result).toEqual('0-6');
});

it('generates tiebreak sets', () => {
  const sets = [
    {
      setNumber: 1,
      side1TiebreakScore: 6,
      side2TiebreakScore: 8,
      winningSide: 2,
    },
    {
      setNumber: 2,
      side1TiebreakScore: 6,
      side2TiebreakScore: 8,
      winningSide: 2,
    },
  ];
  let result = generateScoreString({ sets });
  expect(result).toEqual('[6-8] [6-8]');
  result = generateScoreString({ sets, winningSide: 2 });
  expect(result).toEqual('[8-6] [8-6]');
});
