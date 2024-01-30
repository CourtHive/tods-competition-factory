import { getDevContext, handleCaughtError, setMethods } from '@Global/state/globalState';
import { isFunction, isObject } from '@Tools/objects';

// constants and types
import { INVALID_VALUES } from '@Constants/errorConditionConstants';
import { SUCCESS } from '@Constants/resultConstants';
import { ResultType } from '@Types/factoryTypes';

export function importMethods(engine, engineInvoke, submittedMethods, traverse, maxDepth?): ResultType {
  if (!isObject(submittedMethods)) return { error: INVALID_VALUES };
  const collectionFilter = Array.isArray(traverse) ? traverse : [];
  const methods = {};
  const attrWalker = (obj, depth = 0) => {
    Object.keys(obj).forEach((key) => {
      if (isFunction(obj[key])) {
        methods[key] = obj[key];
      } else if (
        isObject(obj[key]) &&
        (traverse === true || collectionFilter?.includes(key)) &&
        (maxDepth === undefined || depth < maxDepth)
      ) {
        attrWalker(obj[key], depth + 1);
      }
    });
  };
  attrWalker(submittedMethods);

  setMethods(methods);
  const methodNames = Object.keys(methods).filter((key) => isFunction(methods[key]));
  methodNames.forEach((methodName) => {
    engine[methodName] = (params) => {
      const invoke = () =>
        engineInvoke(engine, {
          [methodName]: methods[methodName],
          ...params,
        });

      if (getDevContext()) {
        return invoke();
      } else {
        try {
          return invoke();
        } catch (err) {
          handleCaughtError({
            engineName: 'engine',
            methodName,
            params,
            err,
          });
        }
      }
    };
  });

  return { ...SUCCESS, ...engine };
}
