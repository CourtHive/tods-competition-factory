export function getDisabledStatus({ extension, dates = [] }) {
  if (!extension) return false;
  if (typeof extension.value === 'boolean' && extension.value) return true;
  if (
    typeof extension.value === 'object' &&
    Array.isArray(extension.value.dates)
  ) {
    // if there is an extension that is an object with a dates array
    // and no dates have been provided then consider the court disabled
    if (!dates.length) return true;

    const disabledDates = dates.filter((date) =>
      extension.value.dates.includes(date)
    );
    // only if all provided dates appear in disabled dates is the court considered disabled
    return !!disabledDates.length;
  }
}
