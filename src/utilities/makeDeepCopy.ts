import { isDateObject } from './dateTime';
import {
  deepCopyEnabled,
  getDevContext,
  setDeepCopyIterations,
} from '../global/state/globalState';

export function makeDeepCopy(
  sourceObject, // arbitrary JSON object; functions will be stripped.
  convertExtensions?, // optional - all extension objects converted to attributes ._key
  internalUse?, // disregard deepCopy being disabled within the engine - necessary for query results
  removeExtensions?, // optional - strip all extension attributes
  iteration = 0 // escape hatch - check against iteration threshold
) {
  const deepCopy = deepCopyEnabled();

  const { stringify, toJSON, ignore, modulate } = deepCopy || {};

  if (
    (!deepCopy?.enabled && !internalUse) ||
    typeof sourceObject !== 'object' ||
    typeof sourceObject === 'function' ||
    sourceObject === null ||
    (typeof deepCopy?.threshold === 'number' && iteration >= deepCopy.threshold)
  ) {
    return sourceObject;
  }

  const devContext = getDevContext({ makeDeepCopy: true });
  if (devContext) {
    setDeepCopyIterations(iteration);
    if (
      typeof devContext === 'object' &&
      (iteration > (devContext.iterationThreshold || 15) ||
        (devContext.firstIteration && iteration === 0)) &&
      devContext.log &&
      (!devContext.notInternalUse ||
        (devContext.notInternalUse && !internalUse))
    ) {
      console.log({ devContext, iteration, internalUse }, sourceObject);
    }
  }

  const targetObject = Array.isArray(sourceObject) ? [] : {};

  const sourceObjectKeys = Object.keys(sourceObject).filter(
    (key) =>
      !internalUse ||
      !ignore ||
      (Array.isArray(ignore) && !ignore.includes(key)) ||
      (typeof ignore === 'function' && !ignore(key))
  );

  const stringifyValue = (key, value) => {
    targetObject[key] =
      typeof value?.toString === 'function'
        ? value.toString()
        : JSON.stringify(value);
  };

  for (const key of sourceObjectKeys) {
    const value = sourceObject[key];
    const modulated =
      typeof modulate === 'function' ? modulate(value) : undefined;
    if (modulated !== undefined) {
      targetObject[key] = modulated;
    } else if (
      convertExtensions &&
      key === 'extensions' &&
      Array.isArray(value)
    ) {
      const extensionConversions = extensionsToAttributes(value);
      Object.assign(targetObject, ...extensionConversions);
    } else if (removeExtensions && key === 'extensions') {
      targetObject[key] = [];
    } else if (Array.isArray(stringify) && stringify.includes(key)) {
      stringifyValue(key, value);
    } else if (
      Array.isArray(toJSON) &&
      toJSON.includes(key) &&
      typeof value?.toJSON === 'function'
    ) {
      targetObject[key] = value.toJSON();
    } else if (value === null) {
      targetObject[key] = undefined;
    } else if (isDateObject(value)) {
      targetObject[key] = new Date(value).toISOString();
    } else {
      targetObject[key] = makeDeepCopy(
        value,
        convertExtensions,
        internalUse,
        removeExtensions,
        iteration + 1
      );
    }
  }

  return targetObject;
}

export function extensionsToAttributes(extensions) {
  return extensions
    ?.map((extension) => {
      const { name, value } = extension;
      return name && value && { [`_${name}`]: value };
    })
    .filter(Boolean);
}
