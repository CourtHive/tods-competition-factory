import { updateFactoryExtension } from '../tournamentEngine/governors/tournamentGovernor/updateFactoryExtension';
import { notifySubscribers } from '../global/state/notifySubscribers';
import { factoryVersion } from '../global/functions/factoryVersion';
import competitionGovernor from './governors/competitionsGovernor';
import publishingGovernor from './governors/publishingGovernor';
import scheduleGovernor from './governors/scheduleGovernor';
import policyGovernor from './governors/policyGovernor';
import queryGovernor from './governors/queryGovernor';
import venueGovernor from './governors/venueGovernor';
import { FactoryEngine } from '../types/factoryTypes';
import { makeDeepCopy } from '../utilities';
import {
  setDeepCopy,
  setDevContext,
  getDevContext,
  deleteNotices,
  removeTournamentRecord,
  getTournamentRecords,
  setTournamentRecords,
  getTournamentId,
  cycleMutationStatus,
  handleCaughtError,
} from '../global/state/globalState';

import {
  getState,
  removeUnlinkedTournamentRecords,
  setState,
  setTournamentRecord,
} from './stateMethods';

import {
  INVALID_VALUES,
  METHOD_NOT_FOUND,
} from '../constants/errorConditionConstants';

export const competitionEngine = (function () {
  const engine: FactoryEngine = {
    getState: (params?) =>
      getState({
        convertExtensions: params?.convertExtensions,
        removeExtensions: params?.removeExtensions,
      }),
    version: () => factoryVersion(),
    reset: () => {
      setTournamentRecords({});
      return processResult();
    },
  };

  importGovernors([
    competitionGovernor,
    policyGovernor,
    queryGovernor,
    publishingGovernor,
    scheduleGovernor,
    venueGovernor,
  ]);

  engine.devContext = (contextCriteria) => {
    setDevContext(contextCriteria);
    return processResult();
  };
  engine.getDevContext = (contextCriteria) => getDevContext(contextCriteria);
  engine.setState = (records, deepCopyOption, deepCopyAttributes) => {
    setDeepCopy(deepCopyOption, deepCopyAttributes);
    const result = setState(records, deepCopyOption);
    return processResult(result);
  };
  engine.setTournamentRecord = (
    tournamentRecord,
    deepCopyOption,
    deepCopyAttributes
  ) => {
    setDeepCopy(deepCopyOption, deepCopyAttributes);
    const result = setTournamentRecord(tournamentRecord, deepCopyOption);
    return processResult(result);
  };
  engine.removeTournamentRecord = (tournamentId) => {
    const result = removeTournamentRecord(tournamentId);
    return processResult(result);
  };
  engine.removeUnlinkedTournamentRecords = () => {
    const result = removeUnlinkedTournamentRecords();
    return processResult(result);
  };

  engine.executionQueue = (directives, rollbackOnError) =>
    executionQueue(directives, rollbackOnError);

  return engine;

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

  function executeFunction(tournamentRecords, method, params, methodName) {
    delete engine.success;
    delete engine.error;

    const start = Date.now();
    const result = method({
      tournamentRecords,
      ...params,
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
    if (Object.keys(log).length > 1) console.log('ce:', log);

    return result;
  }

  function engineInvoke(method, params, methodName) {
    const tournamentRecords = getTournamentRecords();
    const activeTournamentId = getTournamentId();

    const snapshot =
      params?.rollbackOnError && makeDeepCopy(tournamentRecords, false, true);

    const result = executeFunction(
      tournamentRecords,
      method,
      { activeTournamentId, ...params },
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
      Object.values(tournamentRecords).forEach((tournamentRecord) => {
        updateFactoryExtension({
          tournamentRecord,
          value: {
            version: factoryVersion(),
            timeStamp,
          },
        });
      });
      result.modificationsApplied = true;
    }
    if (notify)
      notifySubscribers({
        directives: [{ method, params }],
        mutationStatus,
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
              handleCaughtError({
                engineName: 'competitionEngine',
                methodName,
                params,
                err,
              });
            }
          }
        };
      });
    });
  }

  function executionQueue(directives, rollbackOnError) {
    if (!Array.isArray(directives)) return { error: INVALID_VALUES };
    const tournamentRecords = getTournamentRecords();
    const activeTournamentId = getTournamentId();

    const snapshot =
      rollbackOnError && makeDeepCopy(tournamentRecords, false, true);

    let timeStamp;
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
          console.log('ce:', result);
        }
        return result;
      }

      const result = executeFunction(
        tournamentRecords,
        engine[methodName],
        { activeTournamentId, ...params },
        methodName
      );

      if (result?.error) {
        if (snapshot) setState(snapshot);
        return { ...result, rolledBack: !!snapshot };
      }
      results.push({ ...result, methodName });
      timeStamp = Date.now();
    }

    const mutationStatus = cycleMutationStatus();
    if (mutationStatus) {
      Object.values(tournamentRecords).forEach((tournamentRecord) => {
        updateFactoryExtension({
          tournamentRecord,
          value: {
            version: factoryVersion(),
            timeStamp,
          },
        });
      });
      result.modificationsApplied = true;
    }
    notifySubscribers({ directives, mutationStatus, timeStamp });
    deleteNotices();

    const success = results.every((r) => r.success);

    return { success, results };
  }
})();

export default competitionEngine;
