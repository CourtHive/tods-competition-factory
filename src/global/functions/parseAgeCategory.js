import { isValidDateString } from '../../utilities/dateTime';

import { INVALID_VALUES } from '../../constants/errorConditionConstants';

export function parseAgeCategory({
  tournamentStartDate,
  tournamentEndDate,
  ageRange = 2,
  category,
} = {}) {
  if (
    typeof category !== 'object' ||
    !isValidDateString(tournamentEndDate) ||
    !isValidDateString(tournamentStartDate)
  )
    return { error: INVALID_VALUES };

  const startYear = parseInt(tournamentStartDate.split('-')[0]);
  const endYear = parseInt(tournamentEndDate.split('-')[0]);

  let { ageCategoryCode, ageMax, ageMin, ageMaxDate, ageMinDate } = category;

  const [code, age] = (
    ageCategoryCode?.match(/^([UCO]{1})(\d{1,2})$/) || []
  ).slice(1);

  if (age && code === 'U') {
    const ageMaxYear = startYear - age - 1;
    const ageMinYear = startYear - age - 1 + ageRange;
    if (!ageMaxDate) ageMaxDate = `${ageMaxYear}-12-31`;
    if (!ageMinDate) ageMinDate = `${ageMinYear}-01-01`;
  }

  console.log({
    category,
    startYear,
    endYear,
    code,
    age,
    ageMaxDate,
    ageMax,
    ageMin,
  });

  return { ageMaxDate, ageMinDate };
}
