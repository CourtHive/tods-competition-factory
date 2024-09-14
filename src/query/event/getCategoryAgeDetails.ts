import { dateStringDaysChange, extractDate, isValidDateString, zeroPad } from '@Tools/dateTime';
import { definedAttributes } from '@Tools/definedAttributes';
import { isNumeric } from '@Tools/math';

// Constants and types
import { INVALID_CATEGORY, INVALID_DATE } from '@Constants/errorConditionConstants';
import { Category } from '@Types/tournamentTypes';

const typeMatch = (arr, type) => arr.filter(Boolean).every((i) => typeof i === type);
const allNumeric = (arr) => arr.filter(Boolean).every(isNumeric);

type ParseArgs = {
  consideredDate?: string;
  category?: Category;
};
export function getCategoryAgeDetails(params: ParseArgs) {
  const category = params.category;

  if (typeof category !== 'object') return { error: INVALID_CATEGORY };

  let { ageCategoryCode, ageMaxDate, ageMinDate, ageMax, ageMin } = category;

  const categoryName = category.categoryName;
  let combinedAge;

  const isValidCategory =
    typeMatch([ageCategoryCode, ageMaxDate, ageMinDate, categoryName], 'string') &&
    allNumeric([ageMax, ageMin]) &&
    [ageMaxDate, ageMinDate].filter(Boolean).every(isValidDateString);

  if (!isValidCategory) return { error: INVALID_CATEGORY };

  const consideredDate = params.consideredDate ?? extractDate(new Date().toLocaleDateString('sv'));
  if (!isValidDateString(consideredDate)) return { error: INVALID_DATE };

  const [consideredYear] = consideredDate
    .split('-')
    .slice(0, 3)
    .map((n) => parseInt(n));

  const previousDayDate = dateStringDaysChange(consideredDate, -1);
  const [previousDayMonth, previousDay] = previousDayDate
    .split('-')
    .slice(1, 3)
    .map((n) => parseInt(n));
  const previousMonthDay = `${zeroPad(previousDayMonth)}-${zeroPad(previousDay)}`;

  const nextDayDate = dateStringDaysChange(consideredDate, 1);
  const [nextDayMonth, nextDay] = nextDayDate
    .split('-')
    .slice(1, 3)
    .map((n) => parseInt(n));
  const nextMonthDay = `${zeroPad(nextDayMonth)}-${zeroPad(nextDay)}`;

  let calculatedAgeMaxDate = ageMin && dateStringDaysChange(consideredDate, -1 * 365 * ageMin);
  let calculatedAgeMinDate = ageMax && dateStringDaysChange(consideredDate, -1 * 365 * ageMax);

  // collect errors; e.g. provided ageMin does not equal calculated ageMin
  const errors: string[] = [];

  const addError = (errorString: string) => !errors.includes(errorString) && errors.push(errorString);

  ageCategoryCode = ageCategoryCode ?? categoryName;

  const prePost = /^([UO]?)(\d{1,2})([UO]?)$/;
  const extractCombined = /^C(\d{1,2})-(\d{1,2})$/;

  const isBetween = ageCategoryCode?.includes('-');
  const isCombined = isBetween && ageCategoryCode?.match(extractCombined);
  const isCoded = ageCategoryCode?.match(prePost);

  // construct min or max date with or without year
  //const isYYMM = (datePart) => datePart.match(/^\d{2}-\d{2}$/);
  const constructedDate = (y, df) => `${y}-${df}`;

  const uPre = (ageInt) => {
    const ageMinYear = consideredYear - ageInt;
    const newMinDate = constructedDate(ageMinYear, nextMonthDay);

    if (category.ageMinDate && category.ageMinDate !== newMinDate)
      addError(`Invalid submitted ageMinDate: ${ageMinDate}`);

    ageMinDate = newMinDate;

    if (ageCategoryCode) {
      if (category.ageMax && category.ageMax !== ageInt - 1) {
        addError(`Invalid submitted ageMax: ${ageMax}`);
        calculatedAgeMinDate = undefined;
      }
      ageMax = ageInt - 1;
    }
  };

  const uPost = (ageInt) => {
    const ageMinYear = consideredYear - ageInt - 1;
    const newMinDate = constructedDate(ageMinYear, nextMonthDay);

    if (category.ageMin && category.ageMin > ageInt) {
      addError(`Invalid submitted ageMin: ${ageMin}`);
    }

    if (category.ageMax && category.ageMax > ageInt) {
      addError(`Invalid submitted ageMax: ${ageMax}`);
    }

    if (category.ageMinDate && category.ageMinDate !== newMinDate)
      addError(`Invalid submitted ageMinDate: ${ageMinDate}`);

    ageMinDate = newMinDate;

    if (ageCategoryCode) {
      if (category.ageMax && category.ageMax !== ageInt) {
        addError(`Invalid submitted ageMax: ${ageMax}`);
        calculatedAgeMaxDate = undefined;
      }
      ageMax = ageInt;
    }
  };

  const oPre = (ageInt) => {
    const ageMaxYear = consideredYear - ageInt;
    const newMaxDate = constructedDate(ageMaxYear, previousMonthDay);

    if (category.ageMaxDate && category.ageMaxDate !== newMaxDate)
      addError(`Invalid submitted ageMaxDate: ${ageMaxDate}`);

    ageMaxDate = newMaxDate;

    if (ageCategoryCode) {
      if (category.ageMin && category.ageMin !== ageInt + 1) {
        addError(`Invalid submitted ageMin: ${ageMin}`);
        calculatedAgeMaxDate = undefined;
      }
      ageMin = ageInt + 1;
    }
  };

  const oPost = (ageInt) => {
    const ageMaxYear = consideredYear - ageInt - 1;
    const newMaxDate = constructedDate(ageMaxYear, previousMonthDay);

    if (category.ageMaxDate && category.ageMaxDate !== newMaxDate)
      addError(`Invalid submitted ageMaxDate: ${ageMaxDate}`);

    ageMaxDate = newMaxDate;

    if (ageCategoryCode) {
      if (category.ageMin && category.ageMin !== ageInt) {
        addError(`Invalid submitted ageMin: ${ageMin}`);
        calculatedAgeMaxDate = undefined;
      }
      ageMin = ageInt;
    }
  };

  const processCode = (code) => {
    const [pre, age, post] = (code.match(prePost) || []).slice(1);
    const ageInt = parseInt(age);
    if (pre === 'U') {
      if (category.ageMaxDate && category.ageMaxDate !== ageMaxDate) {
        addError(`Invalid submitted ageMaxDate: ${category.ageMaxDate}`);
      }
      uPre(ageInt);
    } else if (pre === 'O') {
      oPre(ageInt);
    }

    if (post === 'U') {
      if (category.ageMaxDate && category.ageMaxDate !== ageMaxDate) {
        addError(`Invalid submitted ageMaxDate: ${category.ageMaxDate}`);
      }
      uPost(ageInt);
    } else if (post === 'O') {
      oPost(ageInt);
    }

    ageMaxDate = ageMaxDate ?? calculatedAgeMaxDate;
    ageMinDate = ageMinDate ?? calculatedAgeMinDate;
  };

  if (isCombined) {
    // min and max birthdates are not relevant
    // TODO: utility function to calculate combined age given two birthdates?
    ageMaxDate = undefined;
    ageMinDate = undefined;
    ageMax = undefined;
    ageMin = undefined;

    if (category.ageMin) {
      // calculate ageMaxDate
      const ageMaxYear = consideredYear - category.ageMin;
      ageMaxDate = constructedDate(ageMaxYear, previousMonthDay);
    }
    if (category.ageMax) {
      // calculate ageMinDate
      const ageMinYear = consideredYear - category.ageMax - 1;
      ageMinDate = constructedDate(ageMinYear, nextMonthDay);
    }

    const [lowAge, highAge] = (ageCategoryCode?.match(extractCombined) ?? []).slice(1).map((n) => parseInt(n));
    if (lowAge <= highAge) {
      ageMin = lowAge;
      ageMax = highAge;
      combinedAge = true;
    } else {
      addError(`Invalid combined age range ${ageCategoryCode}`);
    }
  } else if (isBetween) {
    ageCategoryCode?.split('-').forEach(processCode);
  } else if (isCoded) {
    processCode(ageCategoryCode);
  } else {
    if (ageMin) oPre(ageMin);
    if (ageMax) uPost(ageMax);
  }

  if (ageMax && category.ageMin && category.ageMin > ageMax) {
    addError(`Invalid submitted ageMin: ${category.ageMin}`);
    ageMin = undefined;
  }

  const result = definedAttributes({
    consideredDate,
    combinedAge,
    ageMaxDate,
    ageMinDate,
    ageMax,
    ageMin,
  });

  if (errors.length) result.errors = errors;

  return result;
}
