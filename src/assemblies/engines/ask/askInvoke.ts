import { isFunction, isObject, isString } from '../../../utilities/objects';
import { getMethods } from '../../../global/state/syncGlobalState';
import { logMethodNotFound } from '../parts/logMethodNotFound';
import { executeFunction } from '../parts/executeMethod';

import {
  INVALID_VALUES,
  METHOD_NOT_FOUND,
} from '../../../constants/errorConditionConstants';

export function askInvoke(engine: { [key: string]: any }, args: any) {
  if (!isObject(args))
    return { error: INVALID_VALUES, message: 'args must be an object' };
  const methodsCount = Object.values(args).filter(isFunction).length;
  if (methodsCount > 1)
    return {
      message: 'there must be only one arg with typeof function',
      error: INVALID_VALUES,
    };

  const methodName = methodsCount
    ? Object.keys(args).find((key) => isFunction(args[key]))
    : isString(args.method) && args.method;
  if (!methodName) return { error: METHOD_NOT_FOUND };

  const { [methodName]: passedMethod, ...remainingArgs } = args;
  const params = args?.params || { ...remainingArgs };

  const method = passedMethod || engine[methodName] || getMethods()[methodName];
  if (!method) return logMethodNotFound({ methodName, params });

  return executeFunction(engine, method, params, methodName, 'ask');
}
