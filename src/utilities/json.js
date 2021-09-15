import { INVALID_VALUES } from '../constants/errorConditionConstants';

export function JSON2CSV(arrayOfJSON, targetAttributes, joiner = '.') {
  if (!Array.isArray(arrayOfJSON)) return { error: INVALID_VALUES };

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
    .filter(
      (key) => !targetAttributes?.length || targetAttributes.includes(key)
    );

  const process = (row) => headerRow.map((attribute) => row[attribute] || '');

  return [headerRow.join(','), ...flattened.map(process)].join('\r\n');
}

function flatten(obj, joiner = '.', path = []) {
  return Object.keys(obj || {}).reduce((result, attribute) => {
    if (typeof obj[attribute] !== 'object') {
      result[path.concat(attribute).join(joiner)] = obj[attribute];
      return result;
    }
    return Object.assign(
      result,
      flatten(obj[attribute], joiner, path.concat(attribute), result)
    );
  }, {});
}
