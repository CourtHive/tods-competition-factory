import { updateFactoryExtension } from './governors/tournamentGovernor/updateFactoryExtension';
import { notifySubscribersAsync } from '../global/state/notifySubscribers';
import { newTournamentRecord } from './generators/newTournamentRecord';
import { setState, getState, paramsMiddleware } from './stateMethods';
import { factoryVersion } from '../global/functions/factoryVersion';
import participantGovernor from './governors/participantGovernor';
import publishingGovernor from './governors/publishingGovernor';
import tournamentGovernor from './governors/tournamentGovernor';
import scheduleGovernor from './governors/scheduleGovernor';
import policyGovernor from './governors/policyGovernor';
import reportGovernor from './governors/reportGovernor';
import eventGovernor from './governors/eventGovernor';
import queryGovernor from './governors/queryGovernor';
import venueGovernor from './governors/venueGovernor';
import { makeDeepCopy } from '../utilities';
import {
  createInstanceState,
  deleteNotices,
  setDeepCopy,
  setDevContext,
  getTournamentId,
  getTournamentRecord,
  removeTournamentRecord,
  setTournamentId,
  setTournamentRecord,
  cycleMutationStatus,
  getDevContext,
} from '../global/state/globalState';

import { SUCCESS } from '../constants/resultConstants';
import { FactoryEngine } from '../types/factoryTypes';
import {
  INVALID_VALUES,
  METHOD_NOT_FOUND,
} from '../constants/errorConditionConstants';

export function tournamentEngineAsync(
  test?: boolean
): FactoryEngine & { error?: any } {
  const result = createInstanceState();
  if (result.error && !test) return result;

  const engine: FactoryEngine = {
    getState: (params) =>
      getState({
        convertExtensions: params?.convertExtensions,
        removeExtensions: params?.removeExtensions,
        tournamentId: getTournamentId(),
      }),
    newTournamentRecord: (params = {}) => {
      const result = newTournamentRecord(params);
      if (result.error) return result;

      setTournamentRecord(result);
      setTournamentId(result.tournamentId);
      return { tournamentId: result.tournamentId, ...SUCCESS };
    },
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
  engine.devContext = (contextCriteria) => {
    setDevContext(contextCriteria);
    return engine;
  };

  engine.executionQueue = (directives, rollbackOnError) =>
    executionQueueAsync(directives, rollbackOnError);

  function processResult(result?) {
    if (result?.error) {
      engine.error = result.error;
      engine.success = false;
    } else {
      engine.error = undefined;
      engine.success = true;
    }
    return engine;
  }

  importGovernors([
    queryGovernor,
    eventGovernor,
    venueGovernor,
    policyGovernor,
    reportGovernor,
    scheduleGovernor,
    publishingGovernor,
    tournamentGovernor,
    participantGovernor,
  ]);

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
    const tournamentId = getTournamentId();
    const tournamentRecord =
      params?.sandBoxRecord ||
      params?.sandboxRecord ||
      params?.sandboxTournament ||
      getTournamentRecord(tournamentId);

    const snapshot =
      params?.rollbackOnError && makeDeepCopy(tournamentRecord, false, true);

    const result = await executeFunctionAsync(tournamentRecord, method, params);

    if (result?.error && snapshot) setState(snapshot);

    const notify =
      result?.success &&
      params?.delayNotify !== true &&
      params?.doNotNotify !== true;
    const mutationStatus = cycleMutationStatus();
    const timeStamp = Date.now();

    if (mutationStatus) {
      updateFactoryExtension({
        tournamentRecord,
        value: {
          version: factoryVersion(),
          timeStamp,
        },
      });
      result.modificationsApplied = true;
    }

    if (notify)
      await notifySubscribersAsync({
        directives: [{ method, params }],
        mutationStatus,
        tournamentId,
        timeStamp,
      });
    if (notify || !result?.success || params?.doNotNotify) deleteNotices();

    return result;
  }

  function importGovernors(governors) {
    for (const governor of governors) {
      const governorMethods = Object.keys(governor);

      for (const method of governorMethods) {
        engine[method] = async (params) => {
          // if devContext is true then don't trap errors
          if (getDevContext()) {
            return await engineInvoke(governor[method], params);
          } else {
            try {
              return await engineInvoke(governor[method], params);
            } catch (err) {
              const tournamentId = getTournamentId();
              let error;
              if (typeof err === 'string') {
                error = err.toUpperCase();
              } else if (err instanceof Error) {
                error = err.message;
              }

              console.log('ERROR', {
                params: JSON.stringify(params),
                tournamentId,
                method,
                error,
              });
            }
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

    const result: any = {};
    const results: any[] = [];
    for (const directive of directives) {
      if (typeof directive !== 'object') return { error: INVALID_VALUES };

      const { method: methodName, params } = directive;
      if (!engine[methodName]) return { error: METHOD_NOT_FOUND };

      const result = await executeFunctionAsync(
        tournamentRecord,
        engine[methodName],
        params
      );

      if (result?.error) {
        if (snapshot) setState(snapshot);
        return { ...result, rolledBack: !!snapshot };
      }
      results.push({ ...result, methodName });
    }

    const mutationStatus = cycleMutationStatus();
    const timeStamp = Date.now();
    if (mutationStatus) {
      updateFactoryExtension({
        tournamentRecord,
        value: {
          version: factoryVersion(),
          timeStamp,
        },
      });
      result.tournammentModified = true;
    }
    await notifySubscribersAsync({
      mutationStatus,
      tournamentId,
      directives,
      timeStamp,
    });
    deleteNotices();

    const success = results.every((r) => r.success);

    return { success, results };
  }
}

export default tournamentEngineAsync;
