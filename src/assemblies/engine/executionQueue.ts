import { updateFactoryExtension } from '../../tournamentEngine/governors/tournamentGovernor/updateFactoryExtension';
import { engineLogging } from '../../global/functions/producers/engineLogging';
import { notifySubscribers } from '../../global/state/notifySubscribers';
import { factoryVersion } from '../../global/functions/factoryVersion';
import { executeFunction } from './executeFunction';
import { makeDeepCopy } from '../../utilities';
import { setState } from './stateMethods';
import {
  deleteNotices,
  getTournamentRecords,
  getTournamentId,
  cycleMutationStatus,
  getMethods,
} from '../../global/state/globalState';

import {
  INVALID_VALUES,
  METHOD_NOT_FOUND,
} from '../../constants/errorConditionConstants';

export function executionQueue(
  engine: { [key: string]: any },
  directives: { method: string; params?: { [key: string]: any } }[],
  rollbackOnError?: boolean
) {
  if (!Array.isArray(directives)) return { error: INVALID_VALUES };

  const tournamentRecords = getTournamentRecords();
  const activeTournamentId = getTournamentId();
  const methods = getMethods();
  const start = Date.now();

  const snapshot =
    rollbackOnError && makeDeepCopy(tournamentRecords, false, true);

  let timeStamp;
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
      tournamentRecords,
      methods[methodName],
      { activeTournamentId, ...params },
      methodName
    );

    if (result?.error) {
      if (snapshot) setState(snapshot);
      return { ...result, rolledBack: !!snapshot };
    }
    results.push({ ...result, methodName });
    timeStamp = Date.now();
  }

  const mutationStatus = cycleMutationStatus();
  if (mutationStatus) {
    Object.values(tournamentRecords).forEach((tournamentRecord) => {
      updateFactoryExtension({
        tournamentRecord,
        value: {
          version: factoryVersion(),
          timeStamp,
        },
      });
    });
    result.modificationsApplied = true;
  }
  notifySubscribers({ directives, mutationStatus, timeStamp });
  deleteNotices();

  const success = results.every((r) => r.success);

  return { success, results };
}
