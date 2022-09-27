import { deepCopyEnabled } from '../global/state/globalState';
import { isDateObject } from './dateTime';

export function definedAttributes(obj, ignoreFalse, ignoreEmptyArrays) {
  if (typeof obj !== 'object' || obj === null) return obj;
  const deepCopy = deepCopyEnabled();

  const ignoreValues = ['', undefined, null];
  if (ignoreFalse) ignoreValues.push(false);

  const definedKeys = Object.keys(obj).filter(
    (key) =>
      !deepCopy?.ignore.includes(key) &&
      !ignoreValues.includes(obj[key]) &&
      (!ignoreEmptyArrays || (Array.isArray(obj[key]) ? obj[key].length : true))
  );

  const targetObject = Array.isArray(obj) ? [] : {};
  for (const key of definedKeys) {
    const value = obj[key];
    if (deepCopy?.stringify.includes(key)) {
      targetObject[key] =
        typeof value?.toString === 'function'
          ? value.toString()
          : JSON.stringify(value);
    } else if (
      deepCopy?.toJSON.includes(key) &&
      typeof value?.toJSON === 'function'
    ) {
      targetObject[key] = value.toJSON();
    } else if (value === null) {
      targetObject[key] = undefined;
    } else if (isDateObject(value)) {
      targetObject[key] = new Date(value).toISOString();
    } else if (Array.isArray(obj[key])) {
      targetObject[key] = obj[key].map((m) => definedAttributes(m));
    } else {
      targetObject[key] = definedAttributes(obj[key]);
    }
  }

  return targetObject;

  /*
  return Object.assign(
    {},
    ...definedKeys.map((key) => {
      return Array.isArray(obj[key])
        ? { [key]: obj[key].map((m) => definedAttributes(m)) } // doesn't filter out undefined array elements
        : { [key]: definedAttributes(obj[key]) };
    })
  );
  */
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
