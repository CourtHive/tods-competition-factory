export function makeDeepCopy(sourceObject) {
  if (typeof sourceObject !== 'object' || sourceObject === null) {
    return sourceObject;
  }

  const targetObject = Array.isArray(sourceObject) ? [] : {};

  for (const key in sourceObject) {
    const value = sourceObject[key];
    targetObject[key] = makeDeepCopy(value);
  }

  return targetObject;
}
