import { deepCopyEnabled } from '../global/state/globalState';

function getDefinedKeys(obj, ignoreValues, ignoreEmptyArrays) {
  return Object.keys(obj).filter(
    (key) =>
      !ignoreValues.includes(obj[key]) && (!ignoreEmptyArrays || (Array.isArray(obj[key]) ? obj[key].length : true)),
  );
}

export function definedAttributes(obj: object, ignoreFalse?: boolean, ignoreEmptyArrays?: boolean, shallow?: boolean) {
  if (typeof obj !== 'object' || obj === null) return obj;
  const deepCopy = deepCopyEnabled();
  if (!deepCopy?.enabled) shallow = true;

  const ignoreValues: any[] = ['', undefined, null];
  if (ignoreFalse) ignoreValues.push(false);

  const definedKeys = getDefinedKeys(obj, ignoreValues, ignoreEmptyArrays);

  return Object.assign(
    {},
    ...definedKeys.map((key) => {
      return Array.isArray(obj[key])
        ? {
            [key]: shallow ? obj[key] : obj[key].map((m) => definedAttributes(m)),
          } // doesn't filter out undefined array elements
        : { [key]: shallow ? obj[key] : definedAttributes(obj[key]) };
    }),
  );
}
