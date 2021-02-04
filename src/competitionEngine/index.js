import { makeDeepCopy } from '../utilities';
import { drawEngine } from '../drawEngine';

import queryGovernor from './governors/queryGovernor';
import scheduleGovernor from './governors/scheduleGovernor';
import { tournamentEngine } from '../tournamentEngine';
import {
  setSubscriptions,
  setDeepCopy,
  setDevContext,
  getDevContext,
  deleteNotices,
} from '../global/globalState';

import { INVALID_OBJECT } from '../constants/errorConditionConstants';
import { SUCCESS } from '../constants/resultConstants';
import { notifySubscribers } from '../global/notifySubscribers';

let deepCopy = true;
let tournamentRecords;

function setState(records, deepCopyOption = true) {
  if (typeof records !== 'object') return { error: INVALID_OBJECT };
  tournamentRecords = deepCopyOption ? makeDeepCopy(records) : records;
  deepCopy = deepCopyOption;
  return SUCCESS;
}

export const competitionEngine = (async function () {
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

  await importGovernors([
    // locationGovernor,
    queryGovernor,
    scheduleGovernor,
  ]);

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
      tournamentEngine,
      drawEngine,
      deepCopy,
    });

    if (result?.success) {
      await notifySubscribers();
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

export default competitionEngine;
