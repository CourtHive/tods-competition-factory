export function makeDeepCopy(sourceObject) {
  if (typeof sourceObject !== "object" || sourceObject === null) { return sourceObject }
  
  let targetObject = Array.isArray(sourceObject) ? [] : {};

  for (let key in sourceObject) {
    let value = sourceObject[key];
    targetObject[key] = makeDeepCopy(value)
  }

  return targetObject;
}
