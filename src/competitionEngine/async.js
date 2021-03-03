import { notifySubscribersAsync } from '../global/notifySubscribers';
import scheduleGovernor from './governors/scheduleGovernor';
import queryGovernor from './governors/queryGovernor';
import { makeDeepCopy } from '../utilities';
import {
  setSubscriptions,
  setDeepCopy,
  setDevContext,
  getDevContext,
  deleteNotices,
} from '../global/globalState';

import { INVALID_OBJECT } from '../constants/errorConditionConstants';
import { SUCCESS } from '../constants/resultConstants';

let tournamentRecords;

function setState(records, deepCopyOption = true) {
  if (typeof records !== 'object') return { error: INVALID_OBJECT };
  tournamentRecords = deepCopyOption ? makeDeepCopy(records) : records;
  return SUCCESS;
}

export const competitionEngineAsync = (async function () {
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

  importGovernors([queryGovernor, scheduleGovernor]);

  fx.version = () => {
    return '@VERSION@';
  };
  fx.devContext = (isDev) => {
    setDevContext(isDev);
    return fx;
  };
  fx.setState = (tournamentRecords, deepCopyOption) => {
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
  };

  return fx;

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
})();

export default competitionEngineAsync;
