import { notifySubscribersAsync } from '../../../global/state/notifySubscribers';
import { isFunction, isObject, isString } from '../../../utilities/objects';
import { getMethods } from '../../../global/state/syncGlobalState';
import { getMutationStatus } from '../parts/getMutationStatus';
import { executeFunction } from '../parts/executeMethod';
import { makeDeepCopy } from '../../../utilities';
import { setState } from '../parts/stateMethods';
import {
  deleteNotices,
  getTournamentRecords,
} from '../../../global/state/globalState';

import { INVALID_VALUES } from '../../../constants/errorConditionConstants';

export async function asyncEngineInvoke(
  engine: { [key: string]: any },
  args: any
) {
  if (!isObject(args)) return { error: INVALID_VALUES };
  const methodsCount = Object.values(args).filter(isFunction).length;
  if (methodsCount > 1) return { error: INVALID_VALUES };

  const methodName = methodsCount
    ? Object.keys(args).find((key) => isFunction(args[key]))
    : isString(args.method) && args.method;
  if (!methodName) return { error: INVALID_VALUES };

  const { [methodName]: passedMethod, ...remainingArgs } = args;
  const params = args?.params || { ...remainingArgs };

  const snapshot =
    params.rollbackOnError && makeDeepCopy(getTournamentRecords(), false, true);

  const method = passedMethod || engine[methodName] || getMethods()[methodName];

  const result =
    (await executeFunction(engine, method, params, methodName, 'async')) ?? {};

  if (result?.error && snapshot) setState(snapshot);

  const timeStamp = Date.now();
  const mutationStatus = getMutationStatus({ timeStamp });

  const notify =
    result?.success &&
    params?.delayNotify !== true &&
    params?.doNotNotify !== true;

  if (notify)
    await notifySubscribersAsync({
      directives: [{ method, params }],
      mutationStatus,
      timeStamp,
    });
  if (notify || !result?.success || params?.doNotNotify) deleteNotices();

  return result;
}
