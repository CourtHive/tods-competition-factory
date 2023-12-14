import { isFunction, isObject, isString } from '../../../utilities/objects';
import { getMethods } from '../../../global/state/syncGlobalState';
import { executeFunction } from '../executeMethod';

import { INVALID_VALUES } from '../../../constants/errorConditionConstants';

export function askInvoke(engine: { [key: string]: any }, args: any) {
  if (!isObject(args)) return { error: INVALID_VALUES };
  const methodsCount = Object.values(args).filter(isFunction).length;
  if (methodsCount > 1) return { error: INVALID_VALUES };

  const methodName = methodsCount
    ? Object.keys(args).find((key) => isFunction(args[key]))
    : isString(args.method) && args.method;
  if (!methodName) return { error: INVALID_VALUES };

  const { [methodName]: passedMethod, ...remainingArgs } = args;
  const params = args?.params || { ...remainingArgs };

  const method = passedMethod || engine[methodName] || getMethods()[methodName];

  return executeFunction(engine, method, params, methodName);
}
