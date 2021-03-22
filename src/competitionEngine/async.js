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

import { INVALID_OBJECT } from '../constants/errorConditionConstants';
import { SUCCESS } from '../constants/resultConstants';

export function competitionEngineAsync() {
  let tournamentRecords;
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
    devContext: (isDev) => {
      setDevContext(isDev);
      return fx;
    },
    setState: (tournamentRecords, deepCopyOption) => {
      setDeepCopy(deepCopyOption);
      const result = setState(tournamentRecords);
      if (result?.error) {
        fx.error = result.error;
        fx.success = false;
      } else {
        fx.error = undefined;
        fx.success = true;
      }
      return fx;
    },
  };

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
          //If and else are doing same thing! Do we need this
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

  function setState(records, deepCopyOption = true) {
    if (typeof records !== 'object') return { error: INVALID_OBJECT };
    if (Array.isArray(records))
      return {
        error: 'records must be an object with tournamentId keys',
      };
    tournamentRecords = deepCopyOption ? makeDeepCopy(records) : records;
    return SUCCESS;
  }

  return fx;
}

export default competitionEngineAsync;
