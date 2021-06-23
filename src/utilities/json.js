import { INVALID_VALUES } from '../constants/errorConditionConstants';

export function JSON2CSV(arrayOfJSON) {
  if (!Array.isArray(arrayOfJSON)) return INVALID_VALUES;
  const replacer = (_, value) => (value === null ? '' : value);
  const header = Object.keys(arrayOfJSON[0]);
  return [
    header.join(','),
    ...arrayOfJSON.map((row) =>
      header
        .map((fieldName) => JSON.stringify(row[fieldName], replacer))
        .join(',')
    ),
  ].join('\r\n');
}
