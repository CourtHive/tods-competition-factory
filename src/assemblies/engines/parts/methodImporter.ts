import { getDevContext, handleCaughtError, setStateMethods } from '@Global/state/globalState';
import { isFunction } from '@Tools/objects';

// constants and types
import { SUCCESS } from '@Constants/resultConstants';
import { ResultType } from '@Types/factoryTypes';

export function methodImporter(engine, engineInvoke, submittedMethods, traverse, maxDepth, global): ResultType {
  const setResult = setStateMethods(submittedMethods, traverse, maxDepth, global);
  if (setResult.error) return setResult;
  const methods = setResult.methods ?? [];

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
