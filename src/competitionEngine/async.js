import { notifySubscribersAsync } from '../global/state/notifySubscribers';
import competitionGovernor from './governors/competitionsGovernor';
import scheduleGovernor from './governors/scheduleGovernor';
import { factoryVersion } from '../global/functions/factoryVersion';
import policyGovernor from './governors/policyGovernor';
import queryGovernor from './governors/queryGovernor';
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
} from '../global/state/globalState';
import {
  getState,
  removeUnlinkedTournamentRecords,
  setState,
  setTournamentRecord,
} from './stateMethods';

import {
  INVALID_VALUES,
  METHOD_NOT_FOUND,
} from '../constants/errorConditionConstants';

export function competitionEngineAsync(test) {
  const result = createInstanceState();
  if (result.error && !test) return result;

  const engine = {
    getState: ({ convertExtensions, removeExtensions } = {}) =>
      getState({ convertExtensions, removeExtensions }),
    version: () => factoryVersion(),
    reset: () => {
      setTournamentRecords({});
      return processResult();
    },
    setState: (records, deepCopyOption, deepCopyAttributes) => {
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

  function processResult(result) {
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
    queryGovernor,
    scheduleGovernor,
  ]);

  // enable Middleware
  async function engineInvoke(method, params) {
    delete engine.success;
    delete engine.error;

    const tournamentRecords = getTournamentRecords();

    const snapshot =
      params?.rollbackOnError && makeDeepCopy(tournamentRecords, false, true);

    const result = await method({
      ...params,
      tournamentRecords,
    });

    if (result?.error && snapshot) setState(snapshot);

    const notify =
      result?.success &&
      params?.delayNotify !== true &&
      params?.doNotNotify !== true;
    if (notify) await notifySubscribersAsync();
    if (notify || !result?.success || params?.doNotNotify) deleteNotices();

    return result;
  }

  async function importGovernors(governors) {
    for (const governor of governors) {
      const govKeys = Object.keys(governor);
      for (const method of govKeys) {
        engine[method] = async function (params) {
          // if devContext is true then don't trap errors
          if (getDevContext()) {
            const engineResult = await engineInvoke(governor[method], params);
            return engineResult;
          } else {
            try {
              const engineResult = await engineInvoke(governor[method], params);
              return engineResult;
            } catch (err) {
              const error = typeof err === 'object' ? JSON.stringify(err) : err;
              console.log('ERROR', { error, method, params });
            }
          }
        };
      }
    }
  }

  async function executionQueueAsync(directives, rollbackOnError) {
    if (!Array.isArray(directives)) return { error: INVALID_VALUES };
    const tournamentRecords = getTournamentRecords();

    const snapshot =
      rollbackOnError && makeDeepCopy(tournamentRecords, false, true);

    const results = [];
    for (const directive of directives) {
      if (typeof directive !== 'object') return { error: INVALID_VALUES };

      const { method, params } = directive;
      if (!engine[method]) return { error: METHOD_NOT_FOUND };

      const result = await engine[method]({
        ...params,
        tournamentRecords,
      });

      if (result?.error) {
        if (snapshot) setState(snapshot);
        return { ...result, rolledBack: !!snapshot };
      }
      results.push(result);
    }

    await notifySubscribersAsync();
    deleteNotices();

    return { results };
  }

  return engine;
}

export default competitionEngineAsync;
