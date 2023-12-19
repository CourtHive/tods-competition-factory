import participantGovernor from '../../tournamentEngine/governors/participantGovernor';
import publishingGovernor from '../../tournamentEngine/governors/publishingGovernor';
import tournamentGovernor from '../../tournamentEngine/governors/tournamentGovernor';
import scheduleGovernor from '../../tournamentEngine/governors/scheduleGovernor';
import policyGovernor from '../../tournamentEngine/governors/policyGovernor';
import reportGovernor from '../../tournamentEngine/governors/reportGovernor';
import eventGovernor from '../../tournamentEngine/governors/eventGovernor';
import queryGovernor from '../../tournamentEngine/governors/queryGovernor';
import venueGovernor from '../../tournamentEngine/governors/venueGovernor';
import syncEngine from '../../assemblies/engines/sync';

import { newTournamentRecord as newTournament } from '../../tournamentEngine/generators/newTournamentRecord';
import {
  setTournamentRecord,
  setTournamentId,
} from '../../global/state/globalState';
import { SUCCESS } from '../../constants/resultConstants';

function newTournamentRecord(params) {
  const result = newTournament(params);
  const tournamentId = result.tournamentId;
  if (result.error) return result;
  setTournamentRecord(result);
  setTournamentId(tournamentId);
  return { ...SUCCESS, tournamentId };
}

const methods = {
  newTournamentRecord,
  ...participantGovernor,
  ...publishingGovernor,
  ...tournamentGovernor,
  ...scheduleGovernor,
  ...policyGovernor,
  ...reportGovernor,
  ...eventGovernor,
  ...queryGovernor,
  ...venueGovernor,
};

syncEngine.importMethods(methods);

export default syncEngine;
/*
import { updateFactoryExtension } from '../../tournamentEngine/governors/tournamentGovernor/updateFactoryExtension';
import { engineLogging } from '../../global/functions/producers/engineLogging';
import { newTournamentRecord } from '../../tournamentEngine/generators/newTournamentRecord';
import {
  getState,
  paramsMiddleware,
  setState,
} from '../../tournamentEngine/stateMethods';
import { notifySubscribers } from '../../global/state/notifySubscribers';
import { factoryVersion } from '../../global/functions/factoryVersion';
import participantGovernor from '../../tournamentEngine/governors/participantGovernor';
import publishingGovernor from '../../tournamentEngine/governors/publishingGovernor';
import tournamentGovernor from '../../tournamentEngine/governors/tournamentGovernor';
import scheduleGovernor from '../../tournamentEngine/governors/scheduleGovernor';
import policyGovernor from '../../tournamentEngine/governors/policyGovernor';
import reportGovernor from '../../tournamentEngine/governors/reportGovernor';
import eventGovernor from '../../tournamentEngine/governors/eventGovernor';
import queryGovernor from '../../tournamentEngine/governors/queryGovernor';
import venueGovernor from '../../tournamentEngine/governors/venueGovernor';
import { makeDeepCopy } from '../../utilities';
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
  cycleMutationStatus,
  handleCaughtError,
} from '../../global/state/globalState';

import { FactoryEngine } from '../../types/factoryTypes';
import { SUCCESS } from '../../constants/resultConstants';
import {
  INVALID_VALUES,
  METHOD_NOT_FOUND,
} from '../../constants/errorConditionConstants';

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
    engineLogging({ result, methodName, elapsed, params, engineType: 'te:' });

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
              handleCaughtError({
                engineName: 'tournamentEngine',
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

    const start = Date.now();
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
        const elapsed = Date.now() - start;
        engineLogging({
          engineType: 'te:',
          methodName,
          elapsed,
          params,
          result,
        });
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
*/
