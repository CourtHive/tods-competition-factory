import { deepCopyEnabled } from '../global/globalState';
import { isDateObject } from './dateTime';

/**
 *
 * @param {object} sourceObject - arbitrary JSON object; functions not supported.
 * @param {boolean} convertExtensions - optional - all extension objects converted to attributes ._key
 * @param {boolean} internalUse - disregard deepCopy being disabled within the engine - necessary for query results
 * @returns
 */
export function makeDeepCopy(sourceObject, convertExtensions, internalUse) {
  const deepCopy = deepCopyEnabled();
  if (
    (!deepCopy && !internalUse) ||
    typeof sourceObject !== 'object' ||
    sourceObject === null
  ) {
    return sourceObject;
  }

  const targetObject = Array.isArray(sourceObject) ? [] : {};

  for (const key in sourceObject) {
    const value = sourceObject[key];
    if (convertExtensions && key === 'extensions' && Array.isArray(value)) {
      const extensionConversions = extensionsToAttributes(value);
      Object.assign(targetObject, ...extensionConversions);
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
