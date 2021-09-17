import { INVALID_VALUES } from '../constants/errorConditionConstants';

/**
 *
 * @param {object[]} arrayOfJSON - JSON objects array
 * @param {object} config - object which configures processing (see below)
 * @returns {string} - joined by '\r\n' or specified line separator
 *
 * config {
 *  {boolean} includeTransoformAccessors, // transform accessors are included with columnAccessors
 *  {string[]} columnAccessors, // [ 'includeThis', 'andThis' ]
 *  {object} columnTransform, // e.g. { 'newColumnName': ['oldColumn1', 'oldColumn2' ]}
 *  {object} columnMap, // e.g. { 'columnName': 'newColumnName' }
 *  {object} valuesMap, // e.g. { 'columnName': { 'value1': 'mappedValue' }} // useful for mapping IDs
 *  {object} context, // attributes which are to be added to all rows { 'columnName': 'value }
 *  {string} delimiter, // defaults to '"'
 *  {string} columnJoiner, // defaults to ',' // defines how CSV columns are joined
 *  {string} rowJoiner, // defaults to '\r\n' // defines how CSV lines are joined
 *  {string} keyJoiner, // defaults to '.' // defines how flattened column names are constructed
 * }
 *
 * NOTE: `columnTransform` mapped array elements are sensitive to order and will resolve to the first matching value
 * NOTE: `columnMap` should not contain new columnName(s) that are `columnTransform` keys
 */
export function JSON2CSV(arrayOfJSON, config) {
  if (config && typeof config !== 'object') return { error: INVALID_VALUES };
  const {
    includeTransoformAccessors,
    columnAccessors = [],
    columnTransform = {},
    columnMap = {},
    valuesMap = {},
    context = {},

    delimiter = '"',
    columnJoiner = ',',
    rowJoiner = '\r\n',
    keyJoiner = '.',
  } = config || {};

  if (
    !Array.isArray(arrayOfJSON) ||
    !Array.isArray(columnAccessors) ||
    !Array.isArray(Object.keys(columnTransform || {})) ||
    !Array.isArray(Object.keys(columnMap || {})) ||
    !Array.isArray(Object.keys(valuesMap || {})) ||
    !Array.isArray(Object.keys(context || {})) ||
    typeof columnJoiner !== 'string' ||
    typeof rowJoiner !== 'string' ||
    typeof keyJoiner !== 'string' ||
    typeof delimiter !== 'string'
  )
    return { error: INVALID_VALUES };

  const flattened = arrayOfJSON
    .filter(Boolean)
    .map((obj) => flatten(obj, keyJoiner));

  const transformColumns = Object.values(columnTransform).flat();
  if (includeTransoformAccessors) columnAccessors.push(...transformColumns);

  const headerRow = flattened
    .reduce(
      (aggregator, row) =>
        Object.keys(row).every(
          (key) => (!aggregator.includes(key) && aggregator.push(key)) || true
        ) && aggregator,
      []
    )
    .filter((key) => !columnAccessors?.length || columnAccessors.includes(key));

  const accessorMap = Object.assign(
    {},
    ...Object.keys(columnTransform)
      .map((transform) =>
        columnTransform[transform]
          .map((value) => ({ [value]: transform }))
          .flat()
      )
      .flat()
  );

  const tranformedHeaderRow = headerRow.reduce((def, key) => {
    const transform = accessorMap[key];
    if (transform) {
      if (!def.includes(transform)) def.push(transform);
    } else {
      def.push(key);
    }
    return def;
  }, []);

  Object.keys(columnMap).forEach(
    (columnName) =>
      !tranformedHeaderRow.includes(columnName) &&
      tranformedHeaderRow.unshift(columnName)
  );

  Object.keys(columnTransform).forEach(
    (columnName) =>
      !tranformedHeaderRow.includes(columnName) &&
      tranformedHeaderRow.unshift(columnName)
  );

  typeof context === 'object' &&
    Object.keys(context).forEach(
      (columnName) =>
        !tranformedHeaderRow.includes(columnName) &&
        tranformedHeaderRow.unshift(columnName)
    );

  const mappedHeaderRow = tranformedHeaderRow.map(
    (key) => columnMap[key] || key
  );

  const withDelimiter = (value) => `${delimiter}${value}${delimiter}`;

  const processRow = (row) => {
    const columnsMap = Object.values(
      tranformedHeaderRow.reduce((columnsMap, columnName) => {
        const accessors = columnTransform[columnName];
        const value =
          (accessors?.length
            ? row[accessors.find((accessor) => row[accessor])]
            : row[columnName]) ||
          context?.[columnName] ||
          '';

        const mappedValue = valuesMap[columnName]?.[value] || value;
        columnsMap[columnName] = withDelimiter(mappedValue);
        return columnsMap;
      }, {})
    );
    return columnsMap.join(columnJoiner);
  };

  const rows = flattened.map(processRow);

  return [mappedHeaderRow.map(withDelimiter).join(columnJoiner), ...rows].join(
    rowJoiner
  );
}

function flatten(obj, keyJoiner = '.', path = []) {
  return Object.keys(obj || {}).reduce((result, key) => {
    if (typeof obj[key] !== 'object') {
      result[path.concat(key).join(keyJoiner)] = obj[key];
      return result;
    }
    return Object.assign(
      result,
      flatten(obj[key], keyJoiner, path.concat(key), result)
    );
  }, {});
}
