import { isFunction, isObject } from '../../../utilities/objects';
import {
  getDevContext,
  handleCaughtError,
  setMethods,
} from '../../../global/state/globalState';

import { INVALID_VALUES } from '../../../constants/errorConditionConstants';
import { ResultType } from '../../../global/functions/decorateResult';
import { SUCCESS } from '../../../constants/resultConstants';

export function importMethods(engine, engineInvoke, methods): ResultType {
  if (!isObject(methods)) return { error: INVALID_VALUES };
  setMethods(methods);
  const methodNames = Object.keys(methods).filter((key) =>
    isFunction(methods[key])
  );
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
