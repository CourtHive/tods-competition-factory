import { getConvertedRating } from '@Query/participant/getConvertedRating';
import ratingsParameters from '@Fixtures/ratings/ratingsParameters';
import { fixedDecimals } from '@Tools/math';

// constants
import { SINGLES } from '@Constants/matchUpTypes';
import { ELO } from '@Constants/ratingConstants';

export function calculatePressureRatings({ participantResults, sides, score }) {
  // calculate gamesWon times opponent rating
  const side1 = sides.find(({ sideNumber }) => sideNumber === 1);
  const side2 = sides.find(({ sideNumber }) => sideNumber === 2);
  const side1ratings = side1?.participant?.ratings;
  const side2ratings = side2?.participant?.ratings;
  if (side1ratings[SINGLES] && side2ratings[SINGLES]) {
    const targetRatingType = ELO;
    const { convertedRating: side1ConvertedRating } = getConvertedRating({ ratings: side1ratings, targetRatingType });
    const { convertedRating: side2ConvertedRating } = getConvertedRating({ ratings: side2ratings, targetRatingType });
    const { side1pressure, side2pressure } = getSideValues({ side1ConvertedRating, side2ConvertedRating, score });
    participantResults[side1?.participantId].pressureScores.push(side1pressure);
    participantResults[side2?.participantId].pressureScores.push(side2pressure);
    const highRange = Math.max(...ratingsParameters[ELO].range);
    participantResults[side1?.participantId].ratingVariation.push(
      fixedDecimals((side1ConvertedRating - side2ConvertedRating) / highRange),
    );
    participantResults[side2?.participantId].ratingVariation.push(
      fixedDecimals((side2ConvertedRating - side1ConvertedRating) / highRange),
    );
  }
}

export function getSideValues({ side1ConvertedRating, side2ConvertedRating, score }) {
  const lowSide = side1ConvertedRating > side2ConvertedRating ? 2 : 1;
  const highRating = side1ConvertedRating > side2ConvertedRating ? side1ConvertedRating : side2ConvertedRating;
  const lowRating = side1ConvertedRating > side2ConvertedRating ? side2ConvertedRating : side1ConvertedRating;
  const ratingsDifference = Math.abs(side1ConvertedRating - side2ConvertedRating);
  const eloRatingRange = ratingsParameters[ELO].range;
  const rangeMax = Math.max(...eloRatingRange);
  const bumpBump = (rangeMax - highRating) * 0; // for future use - possible to have policy driven curve modification
  const discount = (highRating + bumpBump) / rangeMax;
  const lowSideBump = discount * ratingsDifference;
  const gamesWonSide1 = score?.sets?.reduce((total, set) => total + (set?.side1Score ?? 0), 0);
  const gamesWonSide2 = score?.sets?.reduce((total, set) => total + (set.side2Score ?? 0), 0);
  const side1value = gamesWonSide1 * (lowRating + (lowSide === 1 ? lowSideBump : 0));
  const side2value = gamesWonSide2 * (lowRating + (lowSide === 2 ? lowSideBump : 0));
  const combinedValues = side1value + side2value;
  const side1pressure = fixedDecimals(side1value / combinedValues);
  const side2pressure = fixedDecimals(side2value / combinedValues);
  return { side1pressure, side2pressure };
}
