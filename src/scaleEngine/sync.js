import { getState, paramsMiddleWare, setState } from './stateMethods';
import { notifySubscribers } from '../global/notifySubscribers';
import { factoryVersion } from '../global/factoryVersion';
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
} from '../global/state/globalState';

import rankingsGovernor from './governors/rankingsGovernor';
import ratingsGovernor from './governors/ratingsGovernor';

import {
  INVALID_VALUES,
  METHOD_NOT_FOUND,
} from '../constants/errorConditionConstants';

export const scaleEngine = (function () {
  const engine = {
    getState: ({ convertExtensions, removeExtensions } = {}) =>
      getState({
        convertExtensions,
        removeExtensions,
        tournamentId: getTournamentId(),
      }),
    setTournamentId: (newTournamentId) => setTournamentId(newTournamentId),
  };

  engine.version = () => factoryVersion();
  engine.reset = () => {
    const result = removeTournamentRecord(getTournamentId());
    return processResult(result);
  };
  engine.setState = (tournament, deepCopyOption, deepCopyAttributes) => {
    setDeepCopy(deepCopyOption, deepCopyAttributes);
    const result = setState(tournament, deepCopyOption);
    return processResult(result);
  };
  engine.devContext = (contextCriteria) => {
    setDevContext(contextCriteria);
    return engine;
  };
  engine.getDevContext = (contextCriteria) => getDevContext(contextCriteria);

  engine.executionQueue = (directives, rollbackOnError) =>
    executionQueue(directives, rollbackOnError);

  function processResult(result) {
    if (result?.error) {
      engine.error = result.error;
      engine.success = false;
    } else {
      engine.error = undefined;
      engine.success = true;
    }
    return engine;
  }

  importGovernors([rankingsGovernor, ratingsGovernor]);

  return engine;

  function executeFunction(tournamentRecord, method, params) {
    delete engine.success;
    delete engine.error;

    const augmentedParams = paramsMiddleWare(tournamentRecord, params);
    const result = method({
      ...augmentedParams,
      tournamentRecord,
    });

    return result;
  }

  function engineInvoke(method, params) {
    const tournamentRecord =
      params?.sandBoxRecord ||
      params?.sandboxRecord ||
      params?.sandboxTournament ||
      getTournamentRecord(getTournamentId());

    const snapshot =
      params?.rollbackOnError && makeDeepCopy(tournamentRecord, false, true);

    const result = executeFunction(tournamentRecord, method, params);

    if (result?.error && snapshot) setState(snapshot);

    const notify =
      result?.success &&
      params?.delayNotify !== true &&
      params?.doNotNotify !== true;
    if (notify) notifySubscribers();
    if (notify || !result?.success || params?.doNotNotify) deleteNotices();

    return result;
  }

  function importGovernors(governors) {
    governors.forEach((governor) => {
      Object.keys(governor).forEach((method) => {
        engine[method] = (params) => {
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

  function executionQueue(directives, rollbackOnError) {
    if (!Array.isArray(directives)) return { error: INVALID_VALUES };

    const tournamentId = getTournamentId();
    const tournamentRecord = getTournamentRecord(tournamentId);

    const snapshot =
      rollbackOnError && makeDeepCopy(tournamentRecord, false, true);

    const results = [];
    for (const directive of directives) {
      if (typeof directive !== 'object') return { error: INVALID_VALUES };

      const { method, params } = directive;
      if (!engine[method]) return { error: METHOD_NOT_FOUND };

      const result = executeFunction(tournamentRecord, engine[method], params);

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

export default scaleEngine;
