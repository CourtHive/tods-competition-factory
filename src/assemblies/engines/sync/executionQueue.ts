import { notifySubscribers } from '../../../global/state/notifySubscribers';
import { getMutationStatus } from '../parts/getMutationStatus';
import { logMethodNotFound } from '../parts/logMethodNotFound';
import { makeDeepCopy } from '../../../utilities/makeDeepCopy';
import { executeFunction } from '../parts/executeMethod';
import { setState } from '../parts/stateMethods';
import {
  deleteNotices,
  getTournamentRecords,
  getMethods,
} from '../../../global/state/globalState';

import { INVALID_VALUES } from '../../../constants/errorConditionConstants';
import { Directives } from '../../../types/factoryTypes';

export function executionQueue(
  engine: { [key: string]: any },
  directives: Directives,
  rollbackOnError?: boolean
) {
  if (!Array.isArray(directives))
    return { error: INVALID_VALUES, message: 'directives must be an array' };

  const methods = getMethods();
  const start = Date.now();

  const snapshot =
    rollbackOnError && makeDeepCopy(getTournamentRecords(), false, true);

  const results: any[] = [];
  for (const directive of directives) {
    if (typeof directive !== 'object')
      return { error: INVALID_VALUES, message: 'directive must be an object' };

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
  notifySubscribers({ directives, mutationStatus, timeStamp });
  deleteNotices();

  const success = results.every((r) => r.success);

  return { success, results };
}
