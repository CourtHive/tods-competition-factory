import { deepCopyEnabled } from '../global/globalState';
import { isDateObject } from './dateTime';

/**
 *
 * @param {object} sourceObject - arbitrary JSON object; functions not supported.
 * @param {boolean} convertExtensions - optional - all extension objects converted to attributes ._key
 * @param {boolean} internalUse - disregard deepCopy being disabled within the engine - necessary for query results
 * @returns
 */
export function makeDeepCopy(
  sourceObject,
  convertExtensions,
  internalUse,
  removeExtensions
) {
  const deepCopy = deepCopyEnabled();

  if (
    (!deepCopy?.enabled && !internalUse) ||
    typeof sourceObject !== 'object' ||
    typeof sourceObject === 'function' ||
    sourceObject === null
  ) {
    return sourceObject;
  }

  const targetObject = Array.isArray(sourceObject) ? [] : {};

  const sourceObjectKeys = Object.keys(sourceObject).filter(
    (key) => !internalUse || !deepCopy?.ignore.includes(key)
  );

  for (const key of sourceObjectKeys) {
    const value = sourceObject[key];
    if (convertExtensions && key === 'extensions' && Array.isArray(value)) {
      const extensionConversions = extensionsToAttributes(value);
      Object.assign(targetObject, ...extensionConversions);
    } else if (removeExtensions && key === 'extensions') {
      targetObject[key] = [];
    } else if (internalUse && deepCopy?.stringify.includes(key)) {
      targetObject[key] =
        typeof value?.toString === 'function'
          ? value.toString()
          : JSON.stringify(value);
    } else if (
      internalUse &&
      deepCopy?.toJSON.includes(key) &&
      typeof value?.toJSON === 'function'
    ) {
      targetObject[key] = value.toJSON();
    } else if (value === null) {
      targetObject[key] = undefined;
    } else if (isDateObject(value)) {
      targetObject[key] = new Date(value).toISOString();
    } else {
      targetObject[key] = makeDeepCopy(value, convertExtensions, internalUse);
    }
  }

  return targetObject;
}

function extensionsToAttributes(extensions) {
  return extensions
    ?.map((extension) => {
      const { name, value } = extension;
      return name && value && { [`_${name}`]: value };
    })
    .filter(Boolean);
}
