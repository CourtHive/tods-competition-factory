import { parseScoreString } from '../../utilities/parseScoreString';

it('can parse winner and loser score strings', () => {
  let scoreString = '6-1 6-1';
  let sets = parseScoreString({ scoreString });
  expect(sets[0].side1Score).toEqual(6);
  expect(sets[0].side2Score).toEqual(1);

  scoreString = '1-6 1-6';
  sets = parseScoreString({ scoreString });
  expect(sets[0].side1Score).toEqual(1);
  expect(sets[0].side2Score).toEqual(6);
});
