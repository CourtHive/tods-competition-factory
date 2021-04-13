import { parseScoreString } from '../../utilities/parseScoreString';

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
