import { validateScore } from '../../../global/validation/validateScore';
import { analyzeScore } from '../../../matchUpEngine/getters/analyzeScore';
import mocksEngine from '../../../mocksEngine';
import { it, test, expect } from 'vitest';

import { FORMAT_STANDARD } from '../../../fixtures/scoring/matchUpFormats';

// prettier-ignore
const scenarios = [
  { score: { sets: [], scoreStringSide1: '', scoreStringSide2: '' }, valid: true },
  { score: { sets: [], scoreStringSide1: {}, scoreStringSide2: '' }, valid: false },
  { score: { sets: [], scoreStringSide1: '', scoreStringSide2: {} }, valid: false },
  { score: { sets: '', scoreStringSide1: '', scoreStringSide2: '' }, valid: false },
  { score: { sets: [{ side1Score: 5, side2Score: 4 }], scoreStringSide1: '5-4', scoreStringSide2: '4-5' }, valid: true },
  { score: { sets: [{ side1Score: 4, side2Score: 5 }], scoreStringSide1: '4-5', scoreStringSide2: '5-4' }, valid: true },
  { score: { sets: [{ side1Score: 9, side2Score: 5 }], scoreStringSide1: '9-5', scoreStringSide2: '5-9' }, valid: true },
  { score: { sets: [{ side1Score: 9, side2Score: 5 }], scoreStringSide1: '9-5', scoreStringSide2: '5-9' }, valid: false, matchUpFormat: FORMAT_STANDARD },
  { score: { sets: [{ side1Score: 6, side2Score: 4, winningSide: 2 }], scoreStringSide1: '', scoreStringSide2: '' }, valid: false },
  { score: { sets: [{ side1Score: 6, side2Score: 4, winningSide: 1 }], scoreStringSide1: '', scoreStringSide2: '' }, valid: false },
  { score: { sets: [{ side1Score: 6, winningSide: 1 }], scoreStringSide1: '', scoreStringSide2: '' }, winningSide: 1, valid: false },
  { score: { sets: [{ side1Score: 6, side2Score: 4, winningSide: 1 }], scoreStringSide1: '', scoreStringSide2: '' }, winningSide: 1, valid: true },
  { score: { sets: [{ side1Score: 6, side2Score: 4, winningSide: 1 }], scoreStringSide1: '', scoreStringSide2: '' }, winningSide: 2, valid: false },
];

test.each(scenarios)(
  'can recognize invalid scores in setMatchUpStatus',
  ({ winningSide, score, matchUpFormat, valid }) => {
    const result = validateScore({ score, matchUpFormat, winningSide });
    if (valid) {
      expect(result.valid).toEqual(true);
    } else {
      expect(result.error).not.toBeUndefined();
    }
  }
);

it('recognizes no AD sets with no tiebreak as valid', () => {
  let score = mocksEngine.generateOutcomeFromScoreString({
    scoreString: '6-1 1-6 10-8',
  }).outcome.score;

  let result = analyzeScore({
    matchUpFormat: FORMAT_STANDARD,
    winningSide: 1,
    score,
  });
  expect(result.valid).toEqual(false);

  result = analyzeScore({
    matchUpFormat: 'SET3-S:6/TB7-F:6',
    winningSide: 1,
    score,
  });
  expect(result.valid).toEqual(true);
});

it('recognizes NOAD tiebreak formats', () => {
  let score = mocksEngine.generateOutcomeFromScoreString({
    scoreString: '6-1 1-6 7-6(6)',
  }).outcome.score;

  let result = analyzeScore({
    matchUpFormat: FORMAT_STANDARD,
    winningSide: 1,
    score,
  });
  expect(result.valid).toEqual(true);

  result = analyzeScore({
    matchUpFormat: 'SET3-S:6/TB7NOAD',
    winningSide: 1,
    score,
  });
  expect(result.valid).toEqual(false);
});

it('recognizes invalid tiebreak scores', () => {
  let score = mocksEngine.generateOutcomeFromScoreString({
    scoreString: '7-6(6)',
  }).outcome.score;

  let result = analyzeScore({
    matchUpFormat: 'SET1-S:6/TB7',
    winningSide: 1,
    score,
  });
  expect(result.valid).toEqual(true);

  result = analyzeScore({
    matchUpFormat: 'SET1-S:6/TB7NOAD',
    winningSide: 1,
    score,
  });
  expect(result.valid).toEqual(false);

  score = {
    scoreStringSide1: '7-6(2)',
    scoreStringSide2: '6-7(2)',
    sets: [
      {
        side1Score: 7,
        side2Score: 6,
        side1TiebreakScore: 4,
        side2TiebreakScore: 2,
        winningSide: 1,
        setNumber: 1,
      },
    ],
  };
  result = analyzeScore({
    matchUpFormat: 'SET1-S:6/TB7',
    winningSide: 1,
    score,
  });
  expect(result.valid).toEqual(false);
});
