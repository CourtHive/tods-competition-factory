import { getRatingConvertedFromELO, getRatingConvertedToELO } from '@Generators/scales/eloConversions';
import { checkRequiredParameters } from '@Helpers/parameters/checkRequiredParameters';
import ratingsParameters from '@Fixtures/ratings/ratingsParameters';

// constants
import { OBJECT, OF_TYPE } from '@Constants/attributeConstants';
import { INVALID_VALUES, NOT_FOUND } from '@Constants/errorConditionConstants';
import { DOUBLES, SINGLES } from '@Constants/matchUpTypes';
import { ELO } from '@Constants/ratingConstants';

type GetConvertedRatingArgs = {
  targetRatingType?: string;
  sourceRating?: string;
  matchUpType?: string;
  ratings: any; // participant ratings { participant: { ratings }}
};

export function getConvertedRating(params: GetConvertedRatingArgs) {
  const paramsCheck = checkRequiredParameters(params, [{ ratings: true, [OF_TYPE]: OBJECT }]);
  if (paramsCheck.error) return paramsCheck;

  const matchUpType =
    params.matchUpType && [SINGLES, DOUBLES].includes(params.matchUpType) ? params.matchUpType : SINGLES;

  const ratingTypes = Object.keys(ratingsParameters);
  const targetRatingType =
    params.targetRatingType && ratingTypes.includes(params.targetRatingType) ? params.targetRatingType : ELO;

  const sourceRatings = params.ratings[matchUpType]
    ? params.ratings[matchUpType].reduce(
        (sr, rating) => (sr.includes(rating.scaleName) ? sr : sr.concat(rating.scaleName)),
        [],
      )
    : [];
  if (!sourceRatings) return { error: NOT_FOUND };

  const sourceRatingObject =
    params.ratings[matchUpType]?.find((rating) => rating.scaleName === targetRatingType) ??
    params.ratings[matchUpType]?.[0];
  if (sourceRatings[0] === targetRatingType) return sourceRatingObject;

  const sourceRatingType = sourceRatingObject?.scaleName;

  const accessor = ratingsParameters[sourceRatingObject?.scaleName]?.accessor;
  const sourceRating = (accessor && sourceRatingObject.scaleValue[accessor]) || sourceRatingObject?.scaleValue;
  const eloValue = getRatingConvertedToELO({ sourceRatingType, sourceRating });
  console.log({ sourceRatingType, sourceRatingObject, accessor, sourceRating, eloValue });
  const convertedRating = getRatingConvertedFromELO({
    targetRatingType: targetRatingType,
    sourceRating: eloValue,
  });

  if (!convertedRating) return { error: INVALID_VALUES };

  return { convertedRating, sourceRating };
}
