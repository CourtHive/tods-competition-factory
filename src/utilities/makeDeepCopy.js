import { isDateObject } from './dateTime';
import {
  deepCopyEnabled,
  getDevContext,
  setDeepCopyIterations,
} from '../global/state/globalState';

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
  removeExtensions,
  iteration = 0
) {
  const deepCopy = deepCopyEnabled();

  const { stringify, toJSON, ignore } = deepCopy || {};

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
      (iteration > (devContext.iterationThreshold || 15) ||
        (devContext.firstIteration && iteration === 0)) &&
      devContext.log
    ) {
      if (
        !devContext.notInternalUse ||
        (devContext.notInternalUse && !internalUse)
      ) {
        console.log({ devContext, iteration, internalUse }, sourceObject);
      }
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

  for (const key of sourceObjectKeys) {
    const value = sourceObject[key];
    if (convertExtensions && key === 'extensions' && Array.isArray(value)) {
      const extensionConversions = extensionsToAttributes(value);
      Object.assign(targetObject, ...extensionConversions);
    } else if (removeExtensions && key === 'extensions') {
      targetObject[key] = [];
    } else if (Array.isArray(stringify) && stringify.includes(key)) {
      targetObject[key] =
        typeof value?.toString === 'function'
          ? value.toString()
          : JSON.stringify(value);
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
    } else if (typeof stringify === 'function') {
      targetObject[key] = stringify(value);
    } else if (typeof toJSON === 'function') {
      targetObject[key] = toJSON(value);
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

export function extensionsToAttributes(extensions = []) {
  return extensions
    ?.map((extension) => {
      const { name, value } = extension;
      return name && value && { [`_${name}`]: value };
    })
    .filter(Boolean);
}
