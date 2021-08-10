import { notifySubscribersAsync } from '../global/notifySubscribers';
import competitionGovernor from './governors/competitionsGovernor';
import scheduleGovernor from './governors/scheduleGovernor';
import { factoryVersion } from '../global/factoryVersion';
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
} from '../global/globalState';
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

  const fx = {
    getState: ({ convertExtensions } = {}) => getState({ convertExtensions }),
    version: () => factoryVersion(),
    reset: () => {
      setTournamentRecords({});
      return processResult();
    },
    setState: (records, deepCopyOption) => {
      setDeepCopy(deepCopyOption);
      const result = setState(records, deepCopyOption);
      return processResult(result);
    },
    setTournamentRecord: (tournamentRecord, deepCopyOption) => {
      setDeepCopy(deepCopyOption);
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

  fx.devContext = (contextCriteria) => {
    setDevContext(contextCriteria);
    return fx;
  };
  fx.executionQueue = (directives, rollbackOnError) =>
    executionQueueAsync(fx, directives, rollbackOnError);

  function processResult(result) {
    if (result?.error) {
      fx.error = result.error;
      fx.success = false;
    } else {
      fx.error = undefined;
      fx.success = true;
    }
    return fx;
  }

  importGovernors([
    competitionGovernor,
    policyGovernor,
    queryGovernor,
    scheduleGovernor,
  ]);

  // enable Middleware
  async function engineInvoke(fx, params) {
    const tournamentRecords = getTournamentRecords();

    const snapshot =
      params?.rollbackOnError && makeDeepCopy(tournamentRecords, false, true);

    const result = await fx({
      ...params,
      tournamentRecords,
    });

    if (result?.error && snapshot) setState(snapshot);

    const notify = result?.success && params?.delayNotify !== true;
    if (notify) await notifySubscribersAsync();
    if (notify || !result?.success) deleteNotices();

    return result;
  }

  async function importGovernors(governors) {
    for (const governor of governors) {
      const govKeys = Object.keys(governor);
      for (const govKey of govKeys) {
        fx[govKey] = async function (params) {
          // if devContext is true then don't trap errors
          if (getDevContext()) {
            const engineResult = await engineInvoke(governor[govKey], params);
            return engineResult;
          } else {
            try {
              const engineResult = await engineInvoke(governor[govKey], params);
              return engineResult;
            } catch (err) {
              console.log('%c ERROR', 'color: orange', { err });
            }
          }
        };
      }
    }
  }

  async function executionQueueAsync(fx, directives, rollbackOnError) {
    if (!Array.isArray(directives)) return { error: INVALID_VALUES };
    const tournamentRecords = getTournamentRecords();

    const snapshot =
      rollbackOnError && makeDeepCopy(tournamentRecords, false, true);

    const results = [];
    for (const directive of directives) {
      if (typeof directive !== 'object') return { error: INVALID_VALUES };

      const { method, params } = directive;
      if (!fx[method]) return { error: METHOD_NOT_FOUND };

      const result = await fx[method]({
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

  return fx;
}

export default competitionEngineAsync;
