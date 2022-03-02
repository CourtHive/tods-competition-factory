import { validateScore } from '../../../global/validation/validateScore';

// prettier-ignore
const scenarios = [
  { score: { sets: [], scoreStringSide1: '', scoreStringSide2: '' }, valid: true },
  { score: { sets: [], scoreStringSide1: {}, scoreStringSide2: '' }, valid: false },
  { score: { sets: [], scoreStringSide1: '', scoreStringSide2: {} }, valid: false },
  { score: { sets: '', scoreStringSide1: '', scoreStringSide2: '' }, valid: false },
  { score: { sets: [{ side1Score: 6, side2Score: 4, winningSide: 2 }], scoreStringSide1: '', scoreStringSide2: '' }, valid: false },
  { score: { sets: [{ side1Score: 6, side2Score: 4, winningSide: 1 }], scoreStringSide1: '', scoreStringSide2: '' }, valid: false },
  { score: { sets: [{ side1Score: 6, winningSide: 1 }], scoreStringSide1: '', scoreStringSide2: '' }, winningSide: 1, valid: false },
  { score: { sets: [{ side1Score: 6, side2Score: 4, winningSide: 1 }], scoreStringSide1: '', scoreStringSide2: '' }, winningSide: 1, valid: true },
  { score: { sets: [{ side1Score: 6, side2Score: 4, winningSide: 1 }], scoreStringSide1: '', scoreStringSide2: '' }, winningSide: 2, valid: false },
];

test.each(scenarios)(
  'can recognize invalid scores in setMatchUpStatus',
  ({ winningSide, score, valid }) => {
    const result = validateScore({ score, winningSide });
    if (valid) {
      expect(result.valid).toEqual(true);
    } else {
      expect(result.error).not.toBeUndefined();
    }
  }
);
