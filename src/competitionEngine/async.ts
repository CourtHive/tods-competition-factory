import { updateFactoryExtension } from '../mutate/tournaments/updateFactoryExtension';
import { notifySubscribersAsync } from '../global/state/notifySubscribers';
import { factoryVersion } from '../global/functions/factoryVersion';
import competitionGovernor from './governors/competitionsGovernor';
import publishingGovernor from './governors/publishingGovernor';
import scheduleGovernor from './governors/scheduleGovernor';
import policyGovernor from '../assemblies/governors/policyGovernor';
import queryGovernor from '../assemblies/governors/queryGovernor';
import venueGovernor from './governors/venueGovernor';
import { FactoryEngine } from '../types/factoryTypes';
import { makeDeepCopy } from '../utilities';
import {
  createInstanceState,
  setDeepCopy,
  setDevContext,
  getDevContext,
  deleteNotices,
  removeTournamentRecord,
  setTournamentRecords,
  getTournamentRecords,
  getTournamentId,
  cycleMutationStatus,
  handleCaughtError,
} from '../global/state/globalState';
import { getState, setState, setTournamentRecord } from './stateMethods';
import { removeUnlinkedTournamentRecords } from '../assemblies/engines/parts/stateMethods';

import {
  INVALID_VALUES,
  METHOD_NOT_FOUND,
} from '../constants/errorConditionConstants';

export function competitionEngineAsync(
  test?: boolean
): FactoryEngine & { error?: any } {
  const result = createInstanceState();
  if (result.error && !test) return result;

  const engine: FactoryEngine = {
    getState: (params?) =>
      getState({
        convertExtensions: params?.convertExtensions,
        removeExtensions: params?.removeExtensions,
      }),
    version: () => factoryVersion(),
    reset: () => {
      setTournamentRecords({});
      return processResult();
    },
    setState: (records, deepCopyOption?, deepCopyAttributes?) => {
      setDeepCopy(deepCopyOption, deepCopyAttributes);
      const result = setState(records, deepCopyOption);
      return processResult(result);
    },
    setTournamentRecord: (
      tournamentRecord,
      deepCopyOption,
      deepCopyAttributes
    ) => {
      setDeepCopy(deepCopyOption, deepCopyAttributes);
      const result = setTournamentRecord(tournamentRecord, deepCopyOption);
      return processResult(result);
    },
    removeTournamentRecord: (tournamentId) => {
      const result = removeTournamentRecord(tournamentId);
      return processResult(result);
    },
    removeUnlinkedTournamentRecords: () => {
      const result = removeUnlinkedTournamentRecords();
      return processResult(result);
    },
  };

  engine.devContext = (contextCriteria) => {
    setDevContext(contextCriteria);
    return engine;
  };
  engine.executionQueue = (directives, rollbackOnError) =>
    executionQueueAsync(directives, rollbackOnError);

  function processResult(result?) {
    if (result?.error) {
      engine.error = result.error;
      engine.success = false;
    } else {
      engine.error = undefined;
      engine.success = true;
    }
    return engine;
  }

  importGovernors([
    competitionGovernor,
    policyGovernor,
    publishingGovernor,
    queryGovernor,
    scheduleGovernor,
    venueGovernor,
  ]);

  // enable Middleware
  async function engineInvoke(method, params) {
    delete engine.success;
    delete engine.error;

    const tournamentRecords = getTournamentRecords();
    const activeTournamentId = getTournamentId();

    const snapshot =
      params?.rollbackOnError && makeDeepCopy(tournamentRecords, false, true);

    const result = await method({
      activeTournamentId,
      tournamentRecords,
      ...params,
    });

    if (result?.error && snapshot) setState(snapshot);

    const notify =
      result?.success &&
      params?.delayNotify !== true &&
      params?.doNotNotify !== true;
    const mutationStatus = cycleMutationStatus();
    const timeStamp = Date.now();

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
    }
    if (notify)
      await notifySubscribersAsync({
        directives: [{ method, params }],
        mutationStatus,
      });
    if (notify || !result?.success || params?.doNotNotify) deleteNotices();

    return result;
  }

  async function importGovernors(governors) {
    for (const governor of governors) {
      const govKeys = Object.keys(governor);
      for (const methodName of govKeys) {
        engine[methodName] = async function (params) {
          // if devContext is true then don't trap errors
          if (getDevContext()) {
            return await engineInvoke(governor[methodName], params);
          } else {
            try {
              return await engineInvoke(governor[methodName], params);
            } catch (err) {
              handleCaughtError({
                engineName: 'competitionEngine',
                methodName,
                params,
                err,
              });
            }
          }
        };
      }
    }
  }

  async function executionQueueAsync(directives, rollbackOnError) {
    if (!Array.isArray(directives)) return { error: INVALID_VALUES };
    const tournamentRecords = getTournamentRecords();
    const activeTournamentId = getTournamentId();

    const snapshot =
      rollbackOnError && makeDeepCopy(tournamentRecords, false, true);

    let timeStamp;
    const results: any[] = [];
    for (const directive of directives) {
      if (typeof directive !== 'object') return { error: INVALID_VALUES };

      const { method: methodName, params } = directive;
      if (!engine[methodName]) return { error: METHOD_NOT_FOUND };

      const result = await engine[methodName]({
        activeTournamentId,
        tournamentRecords,
        ...params,
      });

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
    }
    await notifySubscribersAsync({ directives, mutationStatus, timeStamp });
    deleteNotices();

    const success = results.every((r) => r.success);

    return { success, results };
  }

  return engine;
}

export default competitionEngineAsync;
