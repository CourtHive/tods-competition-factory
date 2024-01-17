import { getCategoryAgeDetails } from '../query/event/getCategoryAgeDetails';
import { decorateResult } from '../global/functions/decorateResult';
import { isObject } from '../tools/objects';

import { INVALID_VALUES } from '../constants/errorConditionConstants';
import { isNumeric } from '../tools/math';

export function validateCategory({ category }) {
  if (!isObject(category)) return { error: INVALID_VALUES };

  const categoryDetails = getCategoryAgeDetails({ category });
  if (categoryDetails.error) return { error: categoryDetails };

  const { ratingMax, ratingMin } = category;

  if (ratingMax && !isNumeric(ratingMax))
    return decorateResult({
      result: { error: INVALID_VALUES },
      context: { ratingMax },
    });

  if (ratingMin && !isNumeric(ratingMin))
    return decorateResult({
      result: { error: INVALID_VALUES },
      context: { ratingMin },
    });

  return { ...categoryDetails };
}
