import { deleteNotices, getTournamentRecords } from '../../../global/state/globalState';
import { notifySubscribersAsync } from '../../../global/state/notifySubscribers';
import { isFunction, isObject, isString } from '../../../tools/objects';
import { getMethods } from '../../../global/state/syncGlobalState';
import { getMutationStatus } from '../parts/getMutationStatus';
import { logMethodNotFound } from '../parts/logMethodNotFound';
import { makeDeepCopy } from '../../../tools/makeDeepCopy';
import { executeFunction } from '../parts/executeMethod';
import { setState } from '../parts/stateMethods';

import { INVALID_VALUES, METHOD_NOT_FOUND } from '../../../constants/errorConditionConstants';

export async function asyncEngineInvoke(engine: { [key: string]: any }, args: any) {
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
  const params = args?.params ? { ...args.params } : { ...remainingArgs };

  const snapshot = params.rollbackOnError && makeDeepCopy(getTournamentRecords(), false, true);

  const method = passedMethod || engine[methodName] || getMethods()[methodName];
  if (!method) return logMethodNotFound({ methodName, params });

  const result = (await executeFunction(engine, method, params, methodName, 'async')) ?? {};

  if (result?.error && snapshot) setState(snapshot);

  const timeStamp = Date.now();
  const mutationStatus = getMutationStatus({ timeStamp });

  const notify = result?.success && params?.delayNotify !== true && params?.doNotNotify !== true;

  if (notify)
    await notifySubscribersAsync({
      directives: [{ method, params }],
      mutationStatus,
      timeStamp,
    });
  if (notify || !result?.success || params?.doNotNotify) deleteNotices();

  return result;
}
