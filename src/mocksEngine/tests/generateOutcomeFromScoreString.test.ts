import { generateOutcomeFromScoreString } from '../generators/generateOutcomeFromScoreString';
import { expect, it } from 'vitest';

it('can generate outcomes for either winningSide', () => {
  let values = {
    scoreString: '6-1 6-1',
    winningSide: 1,
  };
  let { outcome } = generateOutcomeFromScoreString(values);
  expect(outcome.score.scoreStringSide1).toEqual('6-1 6-1');
  expect(outcome.score.scoreStringSide2).toEqual('1-6 1-6');
  expect(outcome.score.sets[0].side1Score).toEqual(6);
  expect(outcome.score.sets[0].side2Score).toEqual(1);
  expect(outcome.score.sets[1].side1Score).toEqual(6);
  expect(outcome.score.sets[1].side2Score).toEqual(1);
  expect(outcome.winningSide).toEqual(1);

  values = {
    scoreString: '6-1 6-1',
    winningSide: 2,
  };
  ({ outcome } = generateOutcomeFromScoreString(values));
  expect(outcome.score.scoreStringSide1).toEqual('1-6 1-6');
  expect(outcome.score.scoreStringSide2).toEqual('6-1 6-1');
  expect(outcome.score.sets[0].side1Score).toEqual(1);
  expect(outcome.score.sets[0].side2Score).toEqual(6);
  expect(outcome.score.sets[1].side1Score).toEqual(1);
  expect(outcome.score.sets[1].side2Score).toEqual(6);
  expect(outcome.winningSide).toEqual(2);
});

it('can generate outcomes for short sets', () => {
  const values = {
    scoreString: '4-1 4-1',
    winningSide: 1,
  };
  const { outcome } = generateOutcomeFromScoreString(values);
  expect(outcome.score.scoreStringSide1).toEqual('4-1 4-1');
  expect(outcome.score.scoreStringSide2).toEqual('1-4 1-4');
  expect(outcome.score.sets[0].side1Score).toEqual(4);
  expect(outcome.score.sets[0].side2Score).toEqual(1);
  expect(outcome.score.sets[1].side1Score).toEqual(4);
  expect(outcome.score.sets[1].side2Score).toEqual(1);
  expect(outcome.winningSide).toEqual(1);
});

it('can parse score strings with third set tiebreaks', () => {
  const scoreString = '7-5 5-7 [10-3]';
  const values = { scoreString, winningSide: 1 };
  const { outcome } = generateOutcomeFromScoreString(values);
  expect(outcome.score.scoreStringSide1).toEqual(scoreString);
});
