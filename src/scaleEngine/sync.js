import { getState, paramsMiddleware, setState } from './stateMethods';
import { notifySubscribers } from '../global/state/notifySubscribers';
import { factoryVersion } from '../global/functions/factoryVersion';
import { makeDeepCopy } from '../utilities';
import {
  removeTournamentRecord,
  getTournamentRecord,
  getTournamentId,
  setTournamentId,
  getDevContext,
  deleteNotices,
  setDeepCopy,
} from '../global/state/globalState';

import rankingsGovernor from './governors/rankingsGovernor';
import ratingsGovernor from './governors/ratingsGovernor';

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

    const augmentedParams = paramsMiddleware(tournamentRecord, params);
    return method({
      ...augmentedParams,
      tournamentRecord,
    });
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
            return engineInvoke(governor[method], params);
          } else {
            try {
              return engineInvoke(governor[method], params);
            } catch (err) {
              const error = err.toString();
              console.log('ERROR', {
                error,
                method,
                params: JSON.stringify(params),
              });
            }
          }
        };
      });
    });
  }
})();

export default scaleEngine;
