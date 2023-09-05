import { updateFactoryExtension } from './governors/tournamentGovernor/updateFactoryExtension';
import { newTournamentRecord } from './generators/newTournamentRecord';
import { getState, paramsMiddleware, setState } from './stateMethods';
import { notifySubscribers } from '../global/state/notifySubscribers';
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
  setDeepCopy,
  setDevContext,
  getDevContext,
  deleteNotices,
  getTournamentId,
  getTournamentRecord,
  removeTournamentRecord,
  setTournamentId,
  setTournamentRecord,
  getDeepCopyIterations,
  cycleMutationStatus,
} from '../global/state/globalState';

import { FactoryEngine } from '../types/factoryTypes';
import { SUCCESS } from '../constants/resultConstants';
import {
  INVALID_VALUES,
  METHOD_NOT_FOUND,
} from '../constants/errorConditionConstants';

export const tournamentEngine = ((): FactoryEngine => {
  const engine: FactoryEngine = {
    getState: (params) =>
      getState({
        convertExtensions: params?.convertExtensions,
        removeExtensions: params?.removeExtensions,
        tournamentId: getTournamentId(),
      }),
    newTournamentRecord: (params = {}) => {
      const result = newTournamentRecord(params);
      const tournamentId = result.tournamentId;
      if (result.error) return result;
      setTournamentRecord(result);
      setTournamentId(tournamentId);
      return { ...SUCCESS, tournamentId };
    },
    setTournamentId: (newTournamentId) => setTournamentId(newTournamentId),
    version: () => factoryVersion(),
    reset: () => {
      const result = removeTournamentRecord(getTournamentId());
      return processResult(result);
    },
    setState: (tournament, deepCopyOption, deepCopyAttributes) => {
      setDeepCopy(deepCopyOption, deepCopyAttributes);
      const result = setState(tournament, deepCopyOption);
      return processResult(result);
    },
    getDevContext: (contextCriteria) => getDevContext(contextCriteria),
    executionQueue: (directives, rollbackOnError) =>
      executionQueue(directives, rollbackOnError),
    devContext: (contextCriteria) => {
      setDevContext(contextCriteria);
      return engine;
    },
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

  function executeFunction(tournamentRecord, method, params, methodName) {
    delete engine.success;
    delete engine.error;

    const start = Date.now();
    const augmentedParams = paramsMiddleware(tournamentRecord, params);
    const result = method({
      ...augmentedParams,
      tournamentRecord,
    });
    const elapsed = Date.now() - start;
    const devContext = getDevContext();

    const log: any = { method: methodName };
    const logErrors =
      typeof devContext.result === 'object' && devContext.result.error;
    if (
      ![undefined, false].includes(devContext.perf) &&
      (isNaN(devContext.perf) || elapsed > devContext.perf)
    )
      log.elapsed = elapsed;
    if (
      logErrors ||
      (devContext.params && !Array.isArray(devContext.params)) ||
      (Array.isArray(devContext.params) &&
        devContext.params?.includes(methodName))
    ) {
      log.params = params;
    }
    if (
      logErrors ||
      (!logErrors && devContext.result && !Array.isArray(devContext.result)) ||
      (Array.isArray(devContext.result) &&
        devContext.result?.includes(methodName))
    ) {
      log.result = result;
    }
    if (Object.keys(log).length > 1) console.log('te:', log);

    if (devContext.makeDeepCopy)
      result.deepCopyIterations = getDeepCopyIterations();

    return result;
  }

  function engineInvoke(method, params, methodName) {
    const tournamentId = getTournamentId();
    const tournamentRecord =
      params?.sandBoxRecord ||
      params?.sandboxRecord ||
      params?.sandboxTournament ||
      getTournamentRecord(tournamentId);

    const snapshot =
      params?.rollbackOnError && makeDeepCopy(tournamentRecord, false, true);

    const result = executeFunction(
      tournamentRecord,
      method,
      params,
      methodName
    );

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
      notifySubscribers({
        directives: [{ method, params }],
        mutationStatus,
        tournamentId,
        timeStamp,
      });
    if (notify || !result?.success || params?.doNotNotify) deleteNotices();

    return result;
  }

  function importGovernors(governors) {
    governors.forEach((governor) => {
      Object.keys(governor).forEach((methodName) => {
        engine[methodName] = (params) => {
          if (getDevContext()) {
            return engineInvoke(governor[methodName], params, methodName);
          } else {
            try {
              return engineInvoke(governor[methodName], params, methodName);
            } catch (err) {
              let error;
              if (typeof err === 'string') {
                error = err.toUpperCase();
              } else if (err instanceof Error) {
                error = err.message;
              }

              console.log('ERROR', {
                tournamentId: getTournamentId(),
                params: JSON.stringify(params),
                methodName,
                error,
              });
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

    const result: any = {};
    const results: any[] = [];
    for (const directive of directives) {
      if (typeof directive !== 'object') return { error: INVALID_VALUES };

      const { method: methodName, params } = directive;
      if (!engine[methodName]) {
        const result = { error: METHOD_NOT_FOUND, methodName };
        const devContext = getDevContext();
        if (
          (devContext.result && !Array.isArray(devContext.result)) ||
          (Array.isArray(devContext.result) &&
            devContext.result?.includes(methodName))
        ) {
          console.log('te:', result);
        }
        return result;
      }

      const result: any = executeFunction(
        tournamentRecord,
        engine[methodName],
        params,
        methodName
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
      result.modificationsApplied = true;
    }
    notifySubscribers({ directives, mutationStatus, timeStamp, tournamentId });
    deleteNotices();

    const success = results.every((r) => r.success);

    return { success, results };
  }
})();

export default tournamentEngine;
