import competitionGovernor from './governors/competitionsGovernor';
import { notifySubscribers } from '../global/notifySubscribers';
import scheduleGovernor from './governors/scheduleGovernor';
import policyGovernor from './governors/policyGovernor';
import queryGovernor from './governors/queryGovernor';
import { makeDeepCopy } from '../utilities';
import {
  setSubscriptions,
  setDeepCopy,
  setDevContext,
  getDevContext,
  deleteNotices,
} from '../global/globalState';

import {
  removeTournamentRecord,
  removeUnlinkedTournamentRecords,
  setState,
  setTournamentRecord,
} from './stateMethods';
import { SUCCESS } from '../constants/resultConstants';

let tournamentRecords = {};

export const competitionEngine = (function () {
  const fx = {
    getState: ({ convertExtensions } = {}) => ({
      tournamentRecords: makeDeepCopy(tournamentRecords, convertExtensions),
    }),
    setSubscriptions: (subscriptions) => {
      if (typeof subscriptions === 'object')
        setSubscriptions({ subscriptions });
      return fx;
    },
  };

  importGovernors([
    competitionGovernor,
    policyGovernor,
    queryGovernor,
    scheduleGovernor,
  ]);

  fx.version = () => {
    return '@VERSION@';
  };
  fx.reset = () => {
    tournamentRecords = {};
    return SUCCESS;
  };
  fx.devContext = (isDev) => {
    setDevContext(isDev);
    return fx;
  };
  fx.setState = (records, deepCopyOption) => {
    setDeepCopy(deepCopyOption);
    const result = setState(tournamentRecords, records, deepCopyOption);
    return processResult(result);
  };
  fx.setTournamentRecord = (tournamentRecord, deepCopyOption) => {
    setDeepCopy(deepCopyOption);
    const result = setTournamentRecord(
      tournamentRecords,
      tournamentRecord,
      deepCopyOption
    );
    return processResult(result);
  };
  fx.removeTournamentRecord = (tournamentId) => {
    const result = removeTournamentRecord(tournamentRecords, tournamentId);
    return processResult(result);
  };
  fx.removeUnlinkedTournamentRecords = () => {
    const result = removeUnlinkedTournamentRecords(tournamentRecords);
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
      tournamentRecords = result;
    }
    return fx;
  }

  // enable Middleware
  function engineInvoke(fx, params) {
    const result = fx({
      ...params,
      tournamentRecords,
    });

    if (result?.success) {
      notifySubscribers();
    }
    deleteNotices();

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
