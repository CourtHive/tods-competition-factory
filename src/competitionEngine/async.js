import { notifySubscribersAsync } from '../global/notifySubscribers';
import scheduleGovernor from './governors/scheduleGovernor';
import queryGovernor from './governors/queryGovernor';
import { makeDeepCopy } from '../utilities';
import {
  createInstanceState,
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

export function competitionEngineAsync() {
  let tournamentRecords = {};
  const fx = {
    getState: ({ convertExtensions } = {}) => ({
      tournamentRecords: makeDeepCopy(tournamentRecords, convertExtensions),
    }),
    setSubscriptions: (subscriptions) => {
      if (typeof subscriptions === 'object')
        setSubscriptions({ subscriptions });
      return fx;
    },
    version: () => {
      return '@VERSION@';
    },
    reset: () => {
      tournamentRecords = {};
      return SUCCESS;
    },
    devContext: (isDev) => {
      setDevContext(isDev);
      return fx;
    },
    setState: (records, deepCopyOption) => {
      setDeepCopy(deepCopyOption);
      const result = setState(records, tournamentRecords);
      return processResult(result);
    },
    setTournamentRecord: (tournamentRecord, deepCopyOption) => {
      setDeepCopy(deepCopyOption);
      const result = setTournamentRecord(
        tournamentRecords,
        tournamentRecord,
        deepCopyOption
      );
      return processResult(result);
    },
    removeTournamentRecord: (tournamentId) => {
      const result = removeTournamentRecord(tournamentRecords, tournamentId);
      return processResult(result);
    },
    removeUnlinkedTournamentRecords: () => {
      const result = removeUnlinkedTournamentRecords(tournamentRecords);
      return processResult(result);
    },
  };

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

  createInstanceState();
  importGovernors([queryGovernor, scheduleGovernor]);

  // enable Middleware
  async function engineInvoke(fx, params) {
    const result = await fx({
      ...params,
      tournamentRecords,
    });

    if (result?.success) {
      await notifySubscribersAsync();
    }

    deleteNotices();

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

  return fx;
}

export default competitionEngineAsync;
