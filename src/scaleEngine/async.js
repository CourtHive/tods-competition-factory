import { setState, getState, paramsMiddleWare } from './stateMethods';
import { notifySubscribersAsync } from '../global/notifySubscribers';
import { createInstanceState } from '../global/state/globalState';
import { factoryVersion } from '../global/factoryVersion';
import { makeDeepCopy } from '../utilities';
import {
  deleteNotices,
  setDeepCopy,
  setDevContext,
  getDevContext,
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

  engine.executionQueue = (directives, rollbackOnError) =>
    executionQueueAsync(directives, rollbackOnError);

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

    const augmentedParams = paramsMiddleWare(tournamentRecord, params);

    const result = await method({
      ...augmentedParams,
      tournamentRecord,
    });

    return result;
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
            const result = await engineInvoke(governor[governorMethod], params);

            return result;
          } else {
            const result = await engineInvoke(governor[governorMethod], params);

            return result;
          }
        };
      }
    }
  }

  async function executionQueueAsync(directives, rollbackOnError) {
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

      const result = await executeFunctionAsync(
        tournamentRecord,
        engine[method],
        params
      );

      if (result?.error) {
        if (snapshot) setState(snapshot);
        return { ...result, rolledBack: !!snapshot };
      }
      results.push(result);
    }

    await notifySubscribersAsync();
    deleteNotices();

    return { results };
  }
}

export default scaleEngineAsync;
