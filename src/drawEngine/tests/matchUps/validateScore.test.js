import { validateScore } from '../../../global/validation/validateScore';

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
