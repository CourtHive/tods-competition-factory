import { generateScoreString } from '../generateScoreString';

test('can generate matchUp tiebreak string scores', () => {
  const sets = [
    { side1TiebreakScore: 10, side2TiebreakScore: 3 },
    { side1TiebreakScore: 1, side2TiebreakScore: 10 },
    { side1TiebreakScore: 3 },
  ];
  const result = generateScoreString({ sets });
  expect(result).toEqual('[10-3] [1-10] [3-0]');
});

test('can generate matchUp set scores when no tiebreak', () => {
  const sets = [
    { side1Score: 7, side2Score: 3 },
    { side1Score: 1, side2Score: 7 },
    { side1Score: 3 },
  ];
  const result = generateScoreString({ sets });
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
  const result = generateScoreString({ sets });
  expect(result).toEqual('6-7(3) 7-6(12) 3-0');
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
  const result = generateScoreString({ sets });
  expect(result).toEqual('7-6(12) 6-7(3) 3-0');
});
