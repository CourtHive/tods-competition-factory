import { makeDeepCopy } from '../utilities';
import { auditEngine } from '../auditEngine';
import { drawEngine } from '../drawEngine';
import { tournamentEngine } from '../tournamentEngine';

import queryGovernor from './governors/queryGovernor';
import scheduleGovernor from './governors/scheduleGovernor';
import { SUCCESS } from '../constants/resultConstants';

let devContext;
let errors = [];
let tournamentRecords;

export const competitionEngine = (function() {
  const fx = {
    ...queryGovernor,
    ...scheduleGovernor,
  };

  fx.devContext = isDev => {
    devContext = isDev;
    return fx;
  };
  fx.getState = () => makeDeepCopy(tournamentRecords);

  fx.setState = tournamentRecords => {
    const result = fx.load(tournamentRecords);
    if (result && result.error) errors.push(result.error);
    return fx;
  };

  fx.flushErrors = () => {
    errors = [];
    return fx;
  };

  fx.load = records => {
    if (typeof records !== 'object') return { error: 'Invalid Object' };
    tournamentRecords = makeDeepCopy(records);
    return SUCCESS;
  };

  importGovernors([
    // venueGovernor,
    queryGovernor,
    scheduleGovernor,
  ]);

  return fx;

  // enable Middleware
  function engineInvoke(fx, params) {
    return fx({
      ...params,
      tournamentRecords,
      tournamentEngine,
      auditEngine,
      drawEngine,
    });
  }

  function importGovernors(governors) {
    governors.forEach(governor => {
      Object.keys(governor).forEach(key => {
        fx[key] = params => {
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
