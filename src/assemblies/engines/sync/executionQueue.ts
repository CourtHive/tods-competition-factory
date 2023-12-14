import { notifySubscribers } from '../../../global/state/notifySubscribers';
import { getMutationStatus } from '../getMutationStatus';
import { logMethodNotFound } from '../logMethodNotFound';
import { executeFunction } from '../executeMethod';
import { makeDeepCopy } from '../../../utilities';
import { setState } from '../stateMethods';
import {
  deleteNotices,
  getTournamentRecords,
  getMethods,
} from '../../../global/state/globalState';

import { INVALID_VALUES } from '../../../constants/errorConditionConstants';

export function executionQueue(
  engine: { [key: string]: any },
  directives: { method: string; params?: { [key: string]: any } }[],
  rollbackOnError?: boolean
) {
  if (!Array.isArray(directives)) return { error: INVALID_VALUES };

  const methods = getMethods();
  const start = Date.now();

  const snapshot =
    rollbackOnError && makeDeepCopy(getTournamentRecords(), false, true);

  const result: any = {};
  const results: any[] = [];
  for (const directive of directives) {
    if (typeof directive !== 'object') return { error: INVALID_VALUES };

    const { method: methodName, params } = directive;
    if (!methods[methodName])
      return logMethodNotFound({ methodName, start, params });

    const result = executeFunction(
      engine,
      methods[methodName],
      params,
      methodName,
      'sync'
    );

    if (result?.error) {
      if (snapshot) setState(snapshot);
      return { ...result, rolledBack: !!snapshot };
    }
    results.push({ ...result, methodName });
  }
  const timeStamp = Date.now();

  const mutationStatus = getMutationStatus({ timeStamp });
  result.modificationsApplied = mutationStatus;
  notifySubscribers({ directives, mutationStatus, timeStamp });
  deleteNotices();

  const success = results.every((r) => r.success);

  return { success, results };
}
