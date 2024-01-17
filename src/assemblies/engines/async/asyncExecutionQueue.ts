import { deleteNotices, getTournamentRecords, getMethods } from '../../../global/state/globalState';
import { notifySubscribersAsync } from '../../../global/state/notifySubscribers';
import { getMutationStatus } from '../parts/getMutationStatus';
import { logMethodNotFound } from '../parts/logMethodNotFound';
import { makeDeepCopy } from '../../../tools/makeDeepCopy';
import { executeFunction } from '../parts/executeMethod';
import { setState } from '../parts/stateMethods';

import { INVALID_VALUES } from '../../../constants/errorConditionConstants';
import { Directives, FactoryEngine } from '../../../types/factoryTypes';

export async function asyncExecutionQueue(engine: FactoryEngine, directives: Directives, rollbackOnError?: boolean) {
  if (!Array.isArray(directives)) return { error: INVALID_VALUES, message: 'directives must be an array' };

  const methods = getMethods();
  const start = Date.now();

  const snapshot = rollbackOnError && makeDeepCopy(getTournamentRecords(), false, true);

  const results: any[] = [];
  for (const directive of directives) {
    if (typeof directive !== 'object') return { error: INVALID_VALUES, message: 'directive must be an object' };

    const { method: methodName, params = {}, pipe } = directive;
    if (!methods[methodName]) return logMethodNotFound({ methodName, start, params });

    if (pipe) {
      const lastResult = results[results.length - 1];
      const pipeKeys = Object.keys(pipe);
      for (const pipeKey of pipeKeys) {
        if (lastResult[pipeKey]) params[pipeKey] = lastResult[pipeKey];
      }
    }

    const result = executeFunction(engine, methods[methodName], params, methodName, 'async');

    if (result?.error) {
      if (snapshot) setState(snapshot);
      return { ...result, rolledBack: !!snapshot };
    }
    results.push({ ...result, methodName });
  }
  const timeStamp = Date.now();

  const mutationStatus = getMutationStatus({ timeStamp });
  notifySubscribersAsync({ directives, mutationStatus, timeStamp });
  deleteNotices();

  const success = results.every((r) => r.success);

  return { success, results };
}
