import { isValidDateString } from '../../utilities/dateTime';
import { definedAttributes } from '../../utilities/objects';
import { isNumeric } from '../../utilities/math';

import { INVALID_VALUES } from '../../constants/errorConditionConstants';

import { Category } from '../../types/tournamentFromSchema';

const typeMatch = (arr, type) =>
  arr.filter(Boolean).every((i) => typeof i === type);
const allNumeric = (arr) => arr.filter(Boolean).every(isNumeric);

type ParseArgs = {
  consideredDate: string;
  category?: Category;
};
export function parseAgeCategoryCode(
  { consideredDate, category }: ParseArgs = { consideredDate: '' }
) {
  const invalid = { error: INVALID_VALUES, ageMin: 8, ageMax: 99 };
  if (typeof category !== 'object' || !isValidDateString(consideredDate))
    return invalid;

  const consideredYear = parseInt(consideredDate.split('-')[0]);

  // collect errors; e.g. provided ageMin does not equal calculated ageMin
  const errors: string[] = [];

  let { ageCategoryCode, ageMaxDate, ageMinDate, ageMax, ageMin } = category;
  const categoryName = category.categoryName;
  let combinedAge;

  if (
    !typeMatch(
      [ageCategoryCode, ageMaxDate, ageMinDate, categoryName],
      'string'
    ) ||
    !allNumeric([ageMax, ageMin])
  )
    return invalid;

  ageCategoryCode = ageCategoryCode ?? categoryName;

  const prePost = /^([UO]?)(\d{1,2})([UO]?)$/;
  const extractCombined = /^C(\d{1,2})-(\d{1,2})$/;

  const isBetween = ageCategoryCode?.includes('-');
  const isCombined = isBetween && ageCategoryCode?.match(extractCombined);
  const isCoded = ageCategoryCode?.match(prePost);

  // construct min or max date with or without year
  const isYYMM = (datePart) => datePart.match(/^\d{2}-\d{2}$/);
  const constructedDate = (y, d, df) =>
    (isValidDateString(d) && d) ||
    (d && isYYMM(d) && `${y}-${d}`) ||
    `${y}-${df}`;

  const uPre = (ageInt) => {
    const ageMinYear = consideredYear - ageInt;
    ageMinDate = constructedDate(ageMinYear, ageMinDate, '01-01');
    if (ageMax && ageMax !== ageInt - 1)
      errors.push(`Invalid ageMax: ${ageMax}`);
    if (!ageMax) ageMax = ageInt - 1;
    return { ageMinDate, ageMax };
  };

  const uPost = (ageInt) => {
    const ageMinYear = consideredYear - ageInt - 1;
    ageMinDate = constructedDate(ageMinYear, ageMinDate, '01-01');
    if (ageMax && ageMax !== ageInt) errors.push(`Invalid ageMax: ${ageMax}`);
    if (!ageMax) ageMax = ageInt;
    return { ageMinDate, ageMax };
  };

  const oPre = (ageInt) => {
    const ageMaxYear = consideredYear - ageInt - 2;
    ageMaxDate = constructedDate(ageMaxYear, ageMaxDate, '12-31');
    if (ageMin && ageMin !== ageInt + 1)
      errors.push(`Invalid ageMin: ${ageMin}`);
    if (!ageMin) ageMin = ageInt + 1;
    return { ageMaxDate, ageMin };
  };

  const oPost = (ageInt) => {
    const ageMaxYear = consideredYear - ageInt - 1;
    ageMaxDate = constructedDate(ageMaxYear, ageMaxDate, '12-31');
    if (ageMin && ageMin !== ageInt) errors.push(`Invalid ageMin: ${ageMin}`);
    if (!ageMin) ageMin = ageInt;
    return { ageMaxDate, ageMin };
  };

  const processCode = (code) => {
    const [pre, age, post] = (code.match(prePost) || []).slice(1);
    const ageInt = parseInt(age);
    if (pre === 'U') ({ ageMinDate, ageMax } = uPre(ageInt));
    if (post === 'U') ({ ageMinDate, ageMax } = uPost(ageInt));
    if (pre === 'O') ({ ageMaxDate, ageMin } = oPre(ageInt));
    if (post === 'O') ({ ageMaxDate, ageMin } = oPost(ageInt));
  };

  if (isCombined) {
    const [lowAge, highAge] = (ageCategoryCode?.match(extractCombined) ?? [])
      .slice(1)
      .map((n) => parseInt(n));
    if (lowAge <= highAge) {
      ageMin = ageMin ?? lowAge;
      ageMax = ageMax ?? highAge;
      combinedAge = true;
    } else {
      errors.push(`Invalid combined age range ${ageCategoryCode}`);
    }
  } else if (isBetween) {
    ageCategoryCode?.split('-').forEach(processCode);
  } else if (isCoded) {
    processCode(ageCategoryCode);
  }

  if (errors.length) return { error: errors, ageMin: 8, ageMax: 99 };

  return definedAttributes({
    combinedAge,
    ageMaxDate,
    ageMinDate,
    ageMax,
    ageMin,
  });
}
