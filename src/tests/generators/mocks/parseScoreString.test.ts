import { parseScoreString } from '@Tools/parseScoreString';
import { expect, it } from 'vitest';

it('can parse match tiebreaks', () => {
  let scoreString = '[10-3]';
  let sets = parseScoreString({ scoreString });
  expect(sets[0].side1Score).toEqual(undefined);
  expect(sets[0].side2Score).toEqual(undefined);
  expect(sets[0].side1TiebreakScore).toEqual(10);
  expect(sets[0].side2TiebreakScore).toEqual(3);

  scoreString = '[3-10]';
  sets = parseScoreString({ scoreString });
  expect(sets[0].side1Score).toEqual(undefined);
  expect(sets[0].side2Score).toEqual(undefined);
  expect(sets[0].side1TiebreakScore).toEqual(3);
  expect(sets[0].side2TiebreakScore).toEqual(10);
});

it('can parse set tiebreaks', () => {
  let scoreString = '7-6(3)';
  let sets = parseScoreString({ scoreString });
  expect(sets[0].side1Score).toEqual(7);
  expect(sets[0].side2Score).toEqual(6);
  expect(sets[0].side1TiebreakScore).toEqual(7);
  expect(sets[0].side2TiebreakScore).toEqual(3);

  scoreString = '6-7(3)';
  sets = parseScoreString({ scoreString });
  expect(sets[0].side1Score).toEqual(6);
  expect(sets[0].side2Score).toEqual(7);
  expect(sets[0].side1TiebreakScore).toEqual(3);
  expect(sets[0].side2TiebreakScore).toEqual(7);
});

it('can parse winner and loser score strings', () => {
  let scoreString = '6-1 6-1';
  let sets = parseScoreString({ scoreString });
  expect(sets[0].side1Score).toEqual(6);
  expect(sets[0].side2Score).toEqual(1);
  expect(sets[1].side1Score).toEqual(6);
  expect(sets[1].side2Score).toEqual(1);

  expect(sets[0].winningSide).toEqual(1);
  expect(sets[1].winningSide).toEqual(1);

  scoreString = '1-6 1-6';
  sets = parseScoreString({ scoreString });
  expect(sets[0].side1Score).toEqual(1);
  expect(sets[0].side2Score).toEqual(6);
  expect(sets[1].side1Score).toEqual(1);
  expect(sets[1].side2Score).toEqual(6);

  expect(sets[0].winningSide).toEqual(2);
  expect(sets[1].winningSide).toEqual(2);

  scoreString = '7-6(3) 6-7(2) 7-5';
  sets = parseScoreString({ scoreString });
  expect(sets[0].side1Score).toEqual(7);
  expect(sets[0].side2Score).toEqual(6);
  expect(sets[0].side1TiebreakScore).toEqual(7);
  expect(sets[0].side2TiebreakScore).toEqual(3);

  expect(sets[1].side1Score).toEqual(6);
  expect(sets[1].side2Score).toEqual(7);
  expect(sets[1].side1TiebreakScore).toEqual(2);
  expect(sets[1].side2TiebreakScore).toEqual(7);

  expect(sets[2].side1Score).toEqual(7);
  expect(sets[2].side2Score).toEqual(5);

  expect(sets[0].winningSide).toEqual(1);
  expect(sets[1].winningSide).toEqual(2);
  expect(sets[2].winningSide).toEqual(1);
});

it('can parse tiebreaks with custom tiebreakTo from matchUpFormat', () => {
  // Standard format with TB7
  let scoreString = '7-6(3)';
  let matchUpFormat = 'SET3-S:6/TB7';
  let sets = parseScoreString({ scoreString, matchUpFormat });
  expect(sets[0].side1Score).toEqual(7);
  expect(sets[0].side2Score).toEqual(6);
  expect(sets[0].side1TiebreakScore).toEqual(7);
  expect(sets[0].side2TiebreakScore).toEqual(3);

  // Format with TB9
  scoreString = '4-5(3)';
  matchUpFormat = 'SET1-S:5/TB9@4';
  sets = parseScoreString({ scoreString, matchUpFormat });
  expect(sets[0].side1Score).toEqual(4);
  expect(sets[0].side2Score).toEqual(5);
  expect(sets[0].side1TiebreakScore).toEqual(3);
  expect(sets[0].side2TiebreakScore).toEqual(9);

  // Format with TB10
  scoreString = '7-6(5)';
  matchUpFormat = 'SET3-S:6/TB10';
  sets = parseScoreString({ scoreString, matchUpFormat });
  expect(sets[0].side1Score).toEqual(7);
  expect(sets[0].side2Score).toEqual(6);
  expect(sets[0].side1TiebreakScore).toEqual(10);
  expect(sets[0].side2TiebreakScore).toEqual(5);

  // Format with TB12
  scoreString = '6-7(8)';
  matchUpFormat = 'SET3-S:6/TB12';
  sets = parseScoreString({ scoreString, matchUpFormat });
  expect(sets[0].side1Score).toEqual(6);
  expect(sets[0].side2Score).toEqual(7);
  expect(sets[0].side1TiebreakScore).toEqual(8);
  expect(sets[0].side2TiebreakScore).toEqual(12);
});

it('can parse tiebreaks with finalSetFormat different from main format', () => {
  // SET3-S:6/TB7 F:TB10 - first two sets use TB7, final set is TB10
  let scoreString = '7-6(3) 6-7(4) [11-9]';
  let matchUpFormat = 'SET3-S:6/TB7-F:TB10';
  let sets = parseScoreString({ scoreString, matchUpFormat });
  
  // Set 1: TB7
  expect(sets[0].side1Score).toEqual(7);
  expect(sets[0].side2Score).toEqual(6);
  expect(sets[0].side1TiebreakScore).toEqual(7);
  expect(sets[0].side2TiebreakScore).toEqual(3);

  // Set 2: TB7
  expect(sets[1].side1Score).toEqual(6);
  expect(sets[1].side2Score).toEqual(7);
  expect(sets[1].side1TiebreakScore).toEqual(4);
  expect(sets[1].side2TiebreakScore).toEqual(7);

  // Set 3: TB10 (tiebreak-only)
  expect(sets[2].side1Score).toEqual(11);
  expect(sets[2].side2Score).toEqual(9);
  expect(sets[2].side1TiebreakScore).toEqual(undefined);
  expect(sets[2].side2TiebreakScore).toEqual(undefined);
});

it('uses default TB7 when no matchUpFormat provided', () => {
  // Without matchUpFormat, should default to TB7
  let scoreString = '7-6(3)';
  let sets = parseScoreString({ scoreString });
  expect(sets[0].side1Score).toEqual(7);
  expect(sets[0].side2Score).toEqual(6);
  expect(sets[0].side1TiebreakScore).toEqual(7);
  expect(sets[0].side2TiebreakScore).toEqual(3);

  // With explicit tiebreakTo parameter (legacy)
  scoreString = '7-6(3)';
  sets = parseScoreString({ scoreString, tiebreakTo: 10 });
  expect(sets[0].side1Score).toEqual(7);
  expect(sets[0].side2Score).toEqual(6);
  expect(sets[0].side1TiebreakScore).toEqual(10);
  expect(sets[0].side2TiebreakScore).toEqual(3);
});
