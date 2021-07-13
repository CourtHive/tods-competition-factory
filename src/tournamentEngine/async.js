import { newTournamentRecord } from './generators/newTournamentRecord';
import { setState, getState, paramsMiddleWare } from './stateMethods';
import { notifySubscribersAsync } from '../global/notifySubscribers';
import participantGovernor from './governors/participantGovernor';
import publishingGovernor from './governors/publishingGovernor';
import tournamentGovernor from './governors/tournamentGovernor';
import scheduleGovernor from './governors/scheduleGovernor';
import { createInstanceState } from '../global/globalState';
import { factoryVersion } from '../global/factoryVersion';
import policyGovernor from './governors/policyGovernor';
import eventGovernor from './governors/eventGovernor';
import queryGovernor from './governors/queryGovernor';
import venueGovernor from './governors/venueGovernor';
import { makeDeepCopy } from '../utilities';
import {
  deleteNotices,
  setDeepCopy,
  setDevContext,
  getDevContext,
  getTournamentRecord,
  removeTournamentRecord,
  setTournamentRecord,
} from '../global/globalState';

import { SUCCESS } from '../constants/resultConstants';
import {
  INVALID_VALUES,
  METHOD_NOT_FOUND,
} from '../constants/errorConditionConstants';

export function tournamentEngineAsync(test) {
  const result = createInstanceState();
  if (result.error && !test) return result;

  let tournamentId;

  const fx = {
    getState: ({ convertExtensions } = {}) =>
      getState({ convertExtensions, tournamentId }),
    newTournamentRecord: (params = {}) => {
      const result = newTournamentRecord(params);
      if (result.error) return result;
      setTournamentRecord(result);
      tournamentId = result.tournamentId;
      return Object.assign({ tournamentId }, SUCCESS);
    },
    setTournamentId: (newTournamentId) => {
      // TODO: add globalState method to insure that tournamentRecords[tournamentId] is valid
      tournamentId = newTournamentId;
      return SUCCESS;
    },
  };

  fx.version = () => factoryVersion();
  fx.reset = () => {
    removeTournamentRecord(tournamentId);
    tournamentId = undefined;
    return SUCCESS;
  };
  fx.setState = (tournament, deepCopyOption) => {
    setDeepCopy(deepCopyOption);
    const result = setState(tournament, deepCopyOption);
    return processResult(result);
  };
  fx.devContext = (isDev) => {
    setDevContext(isDev);
    return fx;
  };

  fx.executionQueue = (directives, rollbackOnError) =>
    executionQueueAsync(fx, tournamentId, directives, rollbackOnError);

  function processResult(result) {
    if (result?.error) {
      fx.error = result.error;
      fx.success = false;
    } else {
      fx.error = undefined;
      fx.success = true;
      tournamentId = result.tournamentId;
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

  async function executeFunctionAsync(tournamentRecord, fx, params) {
    const augmentedParams = paramsMiddleWare(tournamentRecord, params);

    const result = await fx({
      ...augmentedParams,
      tournamentRecord,
    });

    return result;
  }

  async function engineInvoke(fx, params) {
    const tournamentRecord = getTournamentRecord(tournamentId);

    const snapshot =
      params?.rollbackOnError && makeDeepCopy(tournamentRecord, false, true);

    const result = await executeFunctionAsync(tournamentRecord, fx, params);

    if (result?.error && snapshot) setState(snapshot);

    const notify = result?.success && params?.delayNotify !== true;
    if (notify) await notifySubscribersAsync();
    if (notify || !result?.success) deleteNotices();

    return result;
  }

  function importGovernors(governors) {
    for (const governor of governors) {
      const governorMethods = Object.keys(governor);

      for (const governorMethod of governorMethods) {
        fx[governorMethod] = async (params) => {
          if (getDevContext()) {
            const result = await engineInvoke(
              governor[governorMethod],
              params,
              governorMethod
            );

            return result;
          } else {
            const result = await engineInvoke(
              governor[governorMethod],
              params,
              governorMethod
            );

            return result;
          }
        };
      }
    }
  }

  async function executionQueueAsync(
    fx,
    tournamentId,
    directives,
    rollbackOnError
  ) {
    if (!Array.isArray(directives)) return { error: INVALID_VALUES };
    const tournamentRecord = getTournamentRecord(tournamentId);

    const snapshot =
      rollbackOnError && makeDeepCopy(tournamentRecord, false, true);

    const results = [];
    for (const directive of directives) {
      if (typeof directive !== 'object') return { error: INVALID_VALUES };

      const { method, params } = directive;
      if (!fx[method]) return { error: METHOD_NOT_FOUND };

      const result = await executeFunctionAsync(
        tournamentRecord,
        fx[method],
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

export default tournamentEngineAsync;
