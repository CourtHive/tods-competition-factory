import { getRatingConvertedFromELO, getRatingConvertedToELO } from '@Generators/scales/eloConversions';
import { expect, it } from 'vitest';

// constants
import { UTR, WTN } from '@Constants/ratingConstants';

const scenarios = [
  { ratingType: WTN, ratingValue: 10 },
  { ratingType: UTR, ratingValue: 10 },
];

it.each(scenarios)('can reliably convert to and from elo', (scenario) => {
  const convertedRating = getRatingConvertedToELO({
    sourceRatingType: scenario.ratingType,
    sourceRating: scenario.ratingValue,
  });
  const originalRating = getRatingConvertedFromELO({
    targetRatingType: scenario.ratingType,
    sourceRating: convertedRating,
  });
  expect(originalRating).toEqual(scenario.ratingValue);
});
