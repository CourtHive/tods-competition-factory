import { INVALID_VALUES } from '../constants/errorConditionConstants';

export function JSON2CSV(arrayOfJSON, config) {
  if (config && typeof config !== 'object') return { error: INVALID_VALUES };
  const { targetKeys = [], columnMap = {}, joiner = '.' } = config || {};
  if (
    !Array.isArray(arrayOfJSON) ||
    !Array.isArray(targetKeys) ||
    !Array.isArray(Object.keys(columnMap || {})) ||
    typeof joiner !== 'string'
  )
    return { error: INVALID_VALUES };

  const flattened = arrayOfJSON
    .filter(Boolean)
    .map((obj) => flatten(obj, joiner));

  const headerRow = flattened
    .reduce(
      (aggregator, row) =>
        Object.keys(row).every(
          (key) => (!aggregator.includes(key) && aggregator.push(key)) || true
        ) && aggregator,
      []
    )
    .filter((key) => !targetKeys?.length || targetKeys.includes(key));

  const mappedHeaderRow = headerRow.map((key) => columnMap[key] || key);
  const process = (row) => headerRow.map((key) => row[key] || '');

  return [mappedHeaderRow.join(','), ...flattened.map(process)].join('\r\n');
}

function flatten(obj, joiner = '.', path = []) {
  return Object.keys(obj || {}).reduce((result, key) => {
    if (typeof obj[key] !== 'object') {
      result[path.concat(key).join(joiner)] = obj[key];
      return result;
    }
    return Object.assign(
      result,
      flatten(obj[key], joiner, path.concat(key), result)
    );
  }, {});
}
