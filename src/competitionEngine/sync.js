import competitionGovernor from './governors/competitionsGovernor';
import { notifySubscribers } from '../global/notifySubscribers';
import scheduleGovernor from './governors/scheduleGovernor';
import { factoryVersion } from '../global/factoryVersion';
import policyGovernor from './governors/policyGovernor';
import queryGovernor from './governors/queryGovernor';
import { makeDeepCopy } from '../utilities';
import {
  setDeepCopy,
  setDevContext,
  getDevContext,
  deleteNotices,
  removeTournamentRecord,
  getTournamentRecords,
} from '../global/globalState';

import {
  getState,
  removeUnlinkedTournamentRecords,
  setState,
  setTournamentRecord,
} from './stateMethods';

import { SUCCESS } from '../constants/resultConstants';
import {
  INVALID_VALUES,
  METHOD_NOT_FOUND,
} from '../constants/errorConditionConstants';

export const competitionEngine = (function () {
  const fx = {
    getState: ({ convertExtensions } = {}) => getState({ convertExtensions }),
  };

  importGovernors([
    competitionGovernor,
    policyGovernor,
    queryGovernor,
    scheduleGovernor,
  ]);

  fx.version = () => factoryVersion();
  fx.reset = () => {
    setTournamentRecord({});
    return SUCCESS;
  };
  fx.devContext = (isDev) => {
    setDevContext(isDev);
    return fx;
  };
  fx.setState = (records, deepCopyOption) => {
    setDeepCopy(deepCopyOption);
    const result = setState(records, deepCopyOption);
    return processResult(result);
  };
  fx.setTournamentRecord = (tournamentRecord, deepCopyOption) => {
    setDeepCopy(deepCopyOption);
    const result = setTournamentRecord(tournamentRecord, deepCopyOption);
    return processResult(result);
  };
  fx.removeTournamentRecord = (tournamentId) => {
    const result = removeTournamentRecord(tournamentId);
    return processResult(result);
  };
  fx.removeUnlinkedTournamentRecords = () => {
    const result = removeUnlinkedTournamentRecords();
    return processResult(result);
  };

  fx.executionQueue = (directives, rollbackOnError) =>
    executionQueue(fx, directives, rollbackOnError);

  return fx;

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

  function engineInvoke(fx, params) {
    const tournamentRecords = getTournamentRecords();

    const snapshot =
      params?.rollbackOnError && makeDeepCopy(tournamentRecords, false, true);

    const result = fx({
      ...params,
      tournamentRecords,
    });

    if (result?.error && snapshot) setState(snapshot);

    const notify = result?.success && params?.delayNotify !== true;
    if (notify) notifySubscribers();
    if (notify || !result?.success) deleteNotices();

    return result;
  }

  function importGovernors(governors) {
    governors.forEach((governor) => {
      Object.keys(governor).forEach((key) => {
        fx[key] = (params) => {
          if (getDevContext()) {
            return engineInvoke(governor[key], params);
          } else {
            try {
              return engineInvoke(governor[key], params);
            } catch (err) {
              console.log('%c ERROR', 'color: orange', { err });
            }
          }
        };
      });
    });
  }

  function executionQueue(fx, directives, rollbackOnError) {
    if (!Array.isArray(directives)) return { error: INVALID_VALUES };
    const tournamentRecords = getTournamentRecords();

    const snapshot =
      rollbackOnError && makeDeepCopy(tournamentRecords, false, true);

    const results = [];
    for (const directive of directives) {
      if (typeof directive !== 'object') return { error: INVALID_VALUES };

      const { method, params } = directive;
      if (!fx[method]) return { error: METHOD_NOT_FOUND };

      const result = fx[method]({
        ...params,
        tournamentRecords,
      });

      if (result?.error) {
        if (snapshot) setState(snapshot);
        return { ...result, rolledBack: !!snapshot };
      }
      results.push(result);
    }

    notifySubscribers();
    deleteNotices();

    return { results };
  }
})();

export default competitionEngine;
