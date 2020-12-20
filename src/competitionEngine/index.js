import { makeDeepCopy } from '../utilities';
import { auditEngine } from '../auditEngine';
import { drawEngine } from '../drawEngine';
import { tournamentEngine } from '../tournamentEngine';

import queryGovernor from './governors/queryGovernor';
import scheduleGovernor from './governors/scheduleGovernor';

import { INVALID_OBJECT } from '../constants/errorConditionConstants';
import { SUCCESS } from '../constants/resultConstants';

let devContext;
let errors = [];
let deepCopy = true;
let tournamentRecords;

function setState(records, deepCopyOption = true) {
  if (typeof records !== 'object') return { error: INVALID_OBJECT };
  tournamentRecords = deepCopyOption ? makeDeepCopy(records) : records;
  deepCopy = deepCopyOption;
  return SUCCESS;
}

function flushErrors() {
  errors = [];
}

export const competitionEngine = (function () {
  const fx = {
    getState: () => ({ tournamentRecords: makeDeepCopy(tournamentRecords) }),
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
    devContext = isDev;
    return fx;
  };
  fx.flushErrors = () => {
    flushErrors();
    return fx;
  };
  fx.setState = (tournamentRecords) => {
    const result = setState(tournamentRecords);
    if (result && result.error) errors.push(result);
    return fx;
  };

  return fx;

  // enable Middleware
  function engineInvoke(fx, params) {
    return fx({
      ...params,
      tournamentRecords,
      tournamentEngine,
      auditEngine,
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
