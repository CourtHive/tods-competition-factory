import { getAccessorValue } from './getAccessorValue';

export function isFunction(obj) {
  return typeof obj === 'function';
}

export function isString(obj) {
  return typeof obj === 'string';
}

export function isObject(obj) {
  return obj !== null && typeof obj === 'object' && !Array.isArray(obj);
}

export function objShallowEqual(o1, o2) {
  if (!isObject(o1) || !isObject(o2)) return false;
  const keys1 = Object.keys(o1);
  const keys2 = Object.keys(o2);

  if (keys1.length !== keys2.length) {
    return false;
  }

  for (const key of keys1) {
    if (o1[key] !== o2[key]) {
      return false;
    }
  }

  return true;
}

export function createMap(objectArray, attribute) {
  if (!Array.isArray(objectArray)) return {};

  return Object.assign(
    {},
    ...(objectArray ?? [])
      .filter(isObject)
      .map((obj) => {
        return (
          obj[attribute] && {
            [obj[attribute]]: obj,
          }
        );
      })
      .filter(Boolean),
  );
}

// e.g. result.find(hav({ attr: value })) -or- result.filter(hav({ attr: value }))
export const hasAttributeValues = (a) => (o) => Object.keys(a).every((key) => o[key] === a[key]);
export const hav = hasAttributeValues;

// extracts targeted attributes
// e.g. const byeAssignments = positionAssignments.filter(xa('bye')).map(xa('drawPosition'));
// supports xa('string'), xa(['string', 'string']), xa({ attr1: true, attr2: true })
export const extractAttributes = (accessor) => (element) =>
  !accessor || typeof element !== 'object'
    ? undefined
    : (Array.isArray(accessor) &&
        accessor.map((a) => ({
          [a]: getAccessorValue({ element, accessor: a })?.value,
        }))) ||
      (typeof accessor === 'object' &&
        Object.keys(accessor).map((key) => ({
          [key]: getAccessorValue({ element, accessor: key })?.value,
        }))) ||
      (typeof accessor === 'string' && getAccessorValue({ element, accessor }))?.value;
export const xa = extractAttributes;

// useful in notifications where back end does not recognize undefined for updates
export function undefinedToNull(obj: object, shallow?: boolean) {
  if (obj === undefined) return null;
  if (typeof obj !== 'object' || obj === null) return obj;

  const definedKeys = Object.keys(obj);
  const notNull = (value) => (value === undefined ? null : value);

  return Object.assign(
    {},
    ...definedKeys.map((key) => {
      return Array.isArray(obj[key])
        ? {
            [key]: shallow ? obj[key] : obj[key].map((m) => undefinedToNull(m)),
          }
        : { [key]: shallow ? notNull(obj[key]) : undefinedToNull(obj[key]) };
    }),
  );
}

function countKeys(o) {
  if (Array.isArray(o)) {
    return o.length + o.map(countKeys).reduce((a, b) => a + b, 0);
  } else if (typeof o === 'object' && o !== null) {
    return (
      Object.keys(o).length +
      Object.keys(o)
        .map((k) => countKeys(o[k]))
        .reduce((a, b) => a + b, 0)
    );
  }
  return 0;
}

export function generateHashCode(o) {
  if (o === null || typeof o !== 'object') return undefined;
  const str = JSON.stringify(o);
  const keyCount = countKeys(o);
  const charSum = str.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
  return [str.length, keyCount, charSum].map((e) => e.toString(36)).join('');
}
