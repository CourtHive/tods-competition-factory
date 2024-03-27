import { getCategoryAgeDetails } from '@Query/event/getCategoryAgeDetails';
import { decorateResult } from '@Functions/global/decorateResult';
import { isObject } from '@Tools/objects';
import { isNumeric } from '@Tools/math';

// constants
import { INVALID_VALUES } from '@Constants/errorConditionConstants';

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
