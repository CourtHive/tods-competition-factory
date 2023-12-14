import { engineLogging } from '../../../global/functions/producers/engineLogging';
import { notifySubscribers } from '../../../global/state/notifySubscribers';
import { getMutationStatus } from '../getMutationStatus';
import { executeFunction } from '../executeMethod';
import { makeDeepCopy } from '../../../utilities';
import { setState } from '../stateMethods';
import {
  deleteNotices,
  getTournamentRecords,
  getMethods,
} from '../../../global/state/globalState';

import {
  INVALID_VALUES,
  METHOD_NOT_FOUND,
} from '../../../constants/errorConditionConstants';

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
    if (!methods[methodName]) {
      const result = { error: METHOD_NOT_FOUND, methodName };
      const elapsed = Date.now() - start;
      engineLogging({ result, methodName, elapsed, params, engine: 'ce:' });
      return result;
    }

    const result = executeFunction(
      engine,
      methods[methodName],
      params,
      methodName
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
