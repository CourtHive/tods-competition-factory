import { notifySubscribersAsync } from '../global/state/notifySubscribers';
import { setState, getState, paramsMiddleware } from './stateMethods';
import { factoryVersion } from '../global/functions/factoryVersion';
import { makeDeepCopy } from '../utilities';
import {
  createInstanceState,
  removeTournamentRecord,
  getTournamentRecord,
  getTournamentId,
  setTournamentId,
  deleteNotices,
  getDevContext,
  setDeepCopy,
} from '../global/state/globalState';

import rankingsGovernor from './governors/rankingsGovernor';
import ratingsGovernor from './governors/ratingsGovernor';

export function scaleEngineAsync(test) {
  const result = createInstanceState();
  if (result.error && !test) return result;

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
    const tournamentId = getTournamentId();
    if (!tournamentId) return processResult();
    const result = removeTournamentRecord(tournamentId);
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

  async function executeFunctionAsync(tournamentRecord, method, params) {
    delete engine.success;
    delete engine.error;

    const augmentedParams = paramsMiddleware(tournamentRecord, params);

    return await method({
      ...augmentedParams,
      tournamentRecord,
    });
  }

  async function engineInvoke(method, params) {
    const tournamentRecord =
      params?.sandBoxRecord ||
      params?.sandboxRecord ||
      params?.sandboxTournament ||
      getTournamentRecord(getTournamentId());

    const snapshot =
      params?.rollbackOnError && makeDeepCopy(tournamentRecord, false, true);

    const result = await executeFunctionAsync(tournamentRecord, method, params);

    if (result?.error && snapshot) setState(snapshot);

    const notify =
      result?.success &&
      params?.delayNotify !== true &&
      params?.doNotNotify !== true;
    if (notify) await notifySubscribersAsync();
    if (notify || !result?.success || params?.doNotNotify) deleteNotices();

    return result;
  }

  function importGovernors(governors) {
    for (const governor of governors) {
      const governorMethods = Object.keys(governor);

      for (const governorMethod of governorMethods) {
        engine[governorMethod] = async (params) => {
          if (getDevContext()) {
            return await engineInvoke(governor[governorMethod], params);
          } else {
            return await engineInvoke(governor[governorMethod], params);
          }
        };
      }
    }
  }
}

export default scaleEngineAsync;
