import ratingsParameters from '@Fixtures/ratings/ratingsParameters';
import { convertRange } from './convertRange';
import { ELO } from '@Constants/ratingConstants';

export function getRatingConvertedToELO({ sourceRatingType, sourceRating }) {
  const sourceRatingRange = ratingsParameters[sourceRatingType].range;
  const invertedScale = sourceRatingRange[0] > sourceRatingRange[1];
  const eloRatingRange = ratingsParameters[ELO].range;

  return convertRange({
    value: invertedScale ? sourceRatingRange[0] - sourceRating : sourceRating,
    sourceRange: sourceRatingRange,
    targetRange: eloRatingRange,
  });
}

export function getRatingConvertedFromELO({ targetRatingType, sourceRating }) {
  const decimalPlaces = ratingsParameters[targetRatingType].decimalsCount || 0;
  const targetRatingRange = ratingsParameters[targetRatingType].range;
  const invertedScale = targetRatingRange[0] > targetRatingRange[1];
  const eloRatingRange = ratingsParameters[ELO].range;

  const result = convertRange({
    targetRange: targetRatingRange,
    sourceRange: eloRatingRange,
    value: sourceRating,
  });
  const convertedRating = parseFloat(parseFloat(result).toFixed(decimalPlaces));
  return invertedScale ? targetRatingRange[0] - convertedRating : convertedRating;
}
