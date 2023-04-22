import { deepCopyEnabled } from '../global/state/globalState';

export function definedAttributes(
  obj,
  ignoreFalse,
  ignoreEmptyArrays,
  shallow
) {
  if (typeof obj !== 'object' || obj === null) return obj;
  const deepCopy = deepCopyEnabled();
  if (!deepCopy?.enabled) shallow = true;

  const ignoreValues = ['', undefined, null];
  if (ignoreFalse) ignoreValues.push(false);

  const definedKeys = Object.keys(obj).filter(
    (key) =>
      !ignoreValues.includes(obj[key]) &&
      (!ignoreEmptyArrays || (Array.isArray(obj[key]) ? obj[key].length : true))
  );

  return Object.assign(
    {},
    ...definedKeys.map((key) => {
      return Array.isArray(obj[key])
        ? {
            [key]: shallow
              ? obj[key]
              : obj[key].map((m) => definedAttributes(m)),
          } // doesn't filter out undefined array elements
        : { [key]: shallow ? obj[key] : definedAttributes(obj[key]) };
    })
  );
}

// useful in notifications where back end does not recognize undefined for updates
export function undefinedToNull(obj, shallow) {
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
    })
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
