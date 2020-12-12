import { isDateObject } from './dateTime';

export function makeDeepCopy(sourceObject) {
  if (typeof sourceObject !== 'object' || sourceObject === null) {
    return sourceObject;
  }

  const targetObject = Array.isArray(sourceObject) ? [] : {};

  for (const key in sourceObject) {
    const value = sourceObject[key];
    if (value === null) {
      targetObject[key] = undefined;
    } else if (isDateObject(value)) {
      targetObject[key] = new Date(value).toISOString();
    } else {
      targetObject[key] = makeDeepCopy(value);
    }
  }

  return targetObject;
}
