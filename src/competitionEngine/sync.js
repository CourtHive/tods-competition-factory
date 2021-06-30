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

  // enable Middleware
  function engineInvoke(fx, params) {
    const tournamentRecords = getTournamentRecords();

    const snapshot =
      params?.rollBackOnError && makeDeepCopy(tournamentRecords, false, true);

    const result = fx({
      ...params,
      tournamentRecords,
    });

    if (result.error && snapshot) setState(snapshot);

    const notify = result?.success && !params?.delayNotify;
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
})();

export default competitionEngine;
