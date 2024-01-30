import { isObject } from '@Tools/objects';

type GetDisabledStatusArgs = {
  dates?: string[];
  extension?: any;
};

export function getDisabledStatus({ dates = [], extension }: GetDisabledStatusArgs) {
  if (!extension) return false;

  // boolean value false means court is entirely disabled
  if (typeof extension.value === 'boolean' && extension.value) return true;
  // even if a court is disabled for specific dates, if no dates are provided then it is not considered disabled
  // REFINEMENT: if disabledDates include all dates from tournament.startDate to tournament.endDate then court is disabled

  if (!dates.length) return false;

  const disabledDates = isObject(extension.value) ? extension.value?.dates : undefined;

  if (Array.isArray(disabledDates)) {
    if (!disabledDates?.length) return false;
    const datesToConsider = disabledDates.filter((date) => !dates.length || dates.includes(date));

    // only if all provided dates appear in disabled dates is the court considered disabled
    return !!datesToConsider.length;
  }

  return undefined;
}
