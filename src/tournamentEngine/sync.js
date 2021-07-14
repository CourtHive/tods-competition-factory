import { newTournamentRecord } from './generators/newTournamentRecord';
import { getState, paramsMiddleWare, setState } from './stateMethods';
import participantGovernor from './governors/participantGovernor';
import publishingGovernor from './governors/publishingGovernor';
import tournamentGovernor from './governors/tournamentGovernor';
import { notifySubscribers } from '../global/notifySubscribers';
import scheduleGovernor from './governors/scheduleGovernor';
import { factoryVersion } from '../global/factoryVersion';
import policyGovernor from './governors/policyGovernor';
import eventGovernor from './governors/eventGovernor';
import queryGovernor from './governors/queryGovernor';
import venueGovernor from './governors/venueGovernor';
import { makeDeepCopy } from '../utilities';
import {
  setDeepCopy,
  setDevContext,
  getDevContext,
  deleteNotices,
  getTournamentId,
  getTournamentRecord,
  removeTournamentRecord,
  setTournamentId,
  setTournamentRecord,
} from '../global/globalState';

import { SUCCESS } from '../constants/resultConstants';
import {
  INVALID_VALUES,
  METHOD_NOT_FOUND,
} from '../constants/errorConditionConstants';

export const tournamentEngine = (function () {
  const fx = {
    getState: ({ convertExtensions } = {}) =>
      getState({ convertExtensions, tournamentId: getTournamentId() }),
    newTournamentRecord: (params = {}) => {
      const result = newTournamentRecord(params);
      if (result.error) return result;
      setTournamentRecord(result);
      setTournamentId(result.tournamentId);
      return Object.assign({ tournamentId: result.tournamentId }, SUCCESS);
    },
    setTournamentId: (newTournamentId) => setTournamentId(newTournamentId),
  };

  fx.version = () => factoryVersion();
  fx.reset = () => removeTournamentRecord(getTournamentId());
  fx.setState = (tournament, deepCopyOption) => {
    setDeepCopy(deepCopyOption);
    const result = setState(tournament, deepCopyOption);
    return processResult(result);
  };
  fx.devContext = (contextCriteria) => {
    setDevContext(contextCriteria);
    return fx;
  };
  fx.getDevContext = (contextCriteria) => getDevContext(contextCriteria);

  fx.executionQueue = (directives, rollbackOnError) =>
    executionQueue(fx, directives, rollbackOnError);

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

  importGovernors([
    queryGovernor,
    eventGovernor,
    venueGovernor,
    policyGovernor,
    scheduleGovernor,
    publishingGovernor,
    tournamentGovernor,
    participantGovernor,
  ]);

  return fx;

  function executeFunction(tournamentRecord, fx, params) {
    const augmentedParams = paramsMiddleWare(tournamentRecord, params);
    const result = fx({
      ...augmentedParams,
      tournamentRecord,
    });

    return result;
  }

  function engineInvoke(fx, params) {
    const tournamentRecord = getTournamentRecord(getTournamentId());

    const snapshot =
      params?.rollbackOnError && makeDeepCopy(tournamentRecord, false, true);

    const result = executeFunction(tournamentRecord, fx, params);

    if (result?.error && snapshot) setState(snapshot);

    const notify = result?.success && params?.delayNotify !== true;
    if (notify) notifySubscribers();
    if (notify || !result?.success) deleteNotices();

    return result;
  }

  function importGovernors(governors) {
    governors.forEach((governor) => {
      Object.keys(governor).forEach((method) => {
        fx[method] = (params) => {
          if (getDevContext()) {
            return engineInvoke(governor[method], params, method);
          } else {
            try {
              return engineInvoke(governor[method], params, method);
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

    const tournamentId = getTournamentId();
    const tournamentRecord = getTournamentRecord(tournamentId);

    const snapshot =
      rollbackOnError && makeDeepCopy(tournamentRecord, false, true);

    const results = [];
    for (const directive of directives) {
      if (typeof directive !== 'object') return { error: INVALID_VALUES };

      const { method, params } = directive;
      if (!fx[method]) return { error: METHOD_NOT_FOUND };

      const result = executeFunction(tournamentRecord, fx[method], params);

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

export default tournamentEngine;
