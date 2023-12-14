import { isFunction, isObject, isString } from '../../../utilities/objects';
import { notifySubscribers } from '../../../global/state/notifySubscribers';
import { getMethods } from '../../../global/state/syncGlobalState';
import { getMutationStatus } from '../getMutationStatus';
import { executeFunction } from '../executeMethod';
import { makeDeepCopy } from '../../../utilities';
import { setState } from '../stateMethods';
import {
  deleteNotices,
  getTournamentRecords,
} from '../../../global/state/globalState';

import { INVALID_VALUES } from '../../../constants/errorConditionConstants';

export function engineInvoke(engine: { [key: string]: any }, args: any) {
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

  const result = executeFunction(engine, method, params, methodName);

  if (result?.error && snapshot) setState(snapshot);

  const timeStamp = Date.now();
  const mutationStatus = getMutationStatus({ timeStamp });
  result.modificationsApplied = mutationStatus;

  const notify =
    result?.success &&
    params?.delayNotify !== true &&
    params?.doNotNotify !== true;
  if (notify)
    notifySubscribers({
      directives: [{ method, params }],
      mutationStatus,
      timeStamp,
    });
  if (notify || !result?.success || params?.doNotNotify) deleteNotices();

  return result;
}
