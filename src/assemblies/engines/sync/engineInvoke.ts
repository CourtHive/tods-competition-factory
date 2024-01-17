import { isFunction, isObject, isString } from '../../../tools/objects';
import { notifySubscribers } from '../../../global/state/notifySubscribers';
import { getMethods } from '../../../global/state/syncGlobalState';
import { logMethodNotFound } from '../parts/logMethodNotFound';
import { getMutationStatus } from '../parts/getMutationStatus';
import { makeDeepCopy } from '../../../tools/makeDeepCopy';
import { executeFunction } from '../parts/executeMethod';
import { setState } from '../parts/stateMethods';
import { deleteNotices, getTournamentRecords } from '../../../global/state/globalState';

import { INVALID_VALUES, METHOD_NOT_FOUND } from '../../../constants/errorConditionConstants';

export function engineInvoke(engine: { [key: string]: any }, args: any) {
  if (!isObject(args)) return { error: INVALID_VALUES, message: 'args must be an object' };
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

  const snapshot = params.rollbackOnError && makeDeepCopy(getTournamentRecords(), false, true);

  const method = passedMethod || engine[methodName] || getMethods()[methodName];
  if (!method) return logMethodNotFound({ methodName, params });

  const result = executeFunction(engine, method, params, methodName, 'sync') ?? {};

  if (result?.error && snapshot) setState(snapshot);

  const timeStamp = Date.now();
  const mutationStatus = getMutationStatus({ timeStamp });

  const notify = result?.success && params?.delayNotify !== true && params?.doNotNotify !== true;
  if (notify)
    notifySubscribers({
      directives: [{ method, params }],
      mutationStatus,
      timeStamp,
    });
  if (notify || !result?.success || params?.doNotNotify) deleteNotices();

  return result;
}
