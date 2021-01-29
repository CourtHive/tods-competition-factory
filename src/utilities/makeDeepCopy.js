import { getDeepCopy } from '../global/globalState';
import { isDateObject } from './dateTime';

export function makeDeepCopy(sourceObject, convertExtensions) {
  const deepCopy = getDeepCopy();
  if (!deepCopy || typeof sourceObject !== 'object' || sourceObject === null) {
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
      targetObject[key] = makeDeepCopy(value, convertExtensions);
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
    .filter((f) => f);
}
