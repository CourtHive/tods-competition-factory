import { getCategoryAgeDetails } from '../getCategoryAgeDetails';
import { definedAttributes } from '../../../utilities';
import { Category } from '../../../types/tournamentFromSchema';

type CategoryCanContainArgs = {
  childCategory: Category;
  withDetails?: boolean;
  category: Category;
};

export function categoryCanContain({
  childCategory,
  withDetails,
  category,
}: CategoryCanContainArgs) {
  const categoryDetails = getCategoryAgeDetails({ category });
  const childCategoryDetails = getCategoryAgeDetails({
    category: childCategory,
  });

  const invalidAgeMin =
    childCategoryDetails.ageMin &&
    ((categoryDetails.ageMin &&
      childCategoryDetails.ageMin < categoryDetails.ageMin) ||
      (categoryDetails.ageMax &&
        childCategoryDetails.ageMin > categoryDetails.ageMax));

  const invalidAgeMax =
    childCategoryDetails.ageMax &&
    ((categoryDetails.ageMax &&
      childCategoryDetails.ageMax > categoryDetails.ageMax) ||
      (categoryDetails.ageMin &&
        childCategoryDetails.ageMax < categoryDetails.ageMin));

  const invalidAgeMinDate =
    childCategoryDetails.ageMinDate &&
    categoryDetails.ageMaxDate &&
    new Date(childCategoryDetails.ageMinDate) >
      new Date(categoryDetails.ageMaxDate);

  const invalidAgeMaxDate =
    childCategoryDetails.ageMaxDate &&
    categoryDetails.ageMinDate &&
    new Date(childCategoryDetails.ageMaxDate) <
      new Date(categoryDetails.ageMinDate);

  const valid =
    !invalidAgeMax &&
    !invalidAgeMin &&
    !invalidAgeMinDate &&
    !invalidAgeMaxDate;

  const ignoreFalse = true;

  const result = definedAttributes(
    {
      valid,
      invalidAgeMax,
      invalidAgeMin,
      invalidAgeMinDate,
      invalidAgeMaxDate,
    },
    ignoreFalse
  );

  if (withDetails) {
    Object.assign(result, { categoryDetails, childCategoryDetails });
  }

  return result;
}
