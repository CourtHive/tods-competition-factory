import { makeDeepCopy } from '../utilities';
import { drawEngine } from '../drawEngine';

import queryGovernor from './governors/queryGovernor';
import scheduleGovernor from './governors/scheduleGovernor';
import { tournamentEngine } from '../tournamentEngine';
import {
  setSubscriptions,
  setDeepCopy,
  setDevContext,
} from '../global/globalState';

import { INVALID_OBJECT } from '../constants/errorConditionConstants';
import { SUCCESS } from '../constants/resultConstants';

let devContext;
let deepCopy = true;
let tournamentRecords;

function setState(records, deepCopyOption = true) {
  if (typeof records !== 'object') return { error: INVALID_OBJECT };
  tournamentRecords = deepCopyOption ? makeDeepCopy(records) : records;
  deepCopy = deepCopyOption;
  return SUCCESS;
}

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
    // locationGovernor,
    queryGovernor,
    scheduleGovernor,
  ]);

  fx.version = () => {
    return '@VERSION@';
  };
  fx.devContext = (isDev) => {
    setDevContext(isDev);
    devContext = isDev;
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
  function engineInvoke(fx, params) {
    return fx({
      ...params,
      tournamentRecords,
      tournamentEngine,
      drawEngine,
      deepCopy,
    });
  }

  function importGovernors(governors) {
    governors.forEach((governor) => {
      Object.keys(governor).forEach((key) => {
        fx[key] = (params) => {
          if (devContext) {
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
