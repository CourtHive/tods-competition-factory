import { updateFactoryExtension } from '../tournamentEngine/governors/tournamentGovernor/updateFactoryExtension';
import { notifySubscribersAsync } from '../global/state/notifySubscribers';
import { factoryVersion } from '../global/functions/factoryVersion';
import competitionGovernor from './governors/competitionsGovernor';
import publishingGovernor from './governors/publishingGovernor';
import scheduleGovernor from './governors/scheduleGovernor';
import policyGovernor from './governors/policyGovernor';
import queryGovernor from './governors/queryGovernor';
import venueGovernor from './governors/venueGovernor';
import { makeDeepCopy } from '../utilities';
import {
  createInstanceState,
  setDeepCopy,
  setDevContext,
  getDevContext,
  deleteNotices,
  removeTournamentRecord,
  setTournamentRecords,
  getTournamentRecords,
  getTournamentId,
  cycleMutationStatus,
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

export function competitionEngineAsync(test) {
  const result = createInstanceState();
  if (result.error && !test) return result;

  const engine = {
    getState: ({ convertExtensions, removeExtensions } = {}) =>
      getState({ convertExtensions, removeExtensions }),
    version: () => factoryVersion(),
    reset: () => {
      setTournamentRecords({});
      return processResult();
    },
    setState: (records, deepCopyOption, deepCopyAttributes) => {
      setDeepCopy(deepCopyOption, deepCopyAttributes);
      const result = setState(records, deepCopyOption);
      return processResult(result);
    },
    setTournamentRecord: (
      tournamentRecord,
      deepCopyOption,
      deepCopyAttributes
    ) => {
      setDeepCopy(deepCopyOption, deepCopyAttributes);
      const result = setTournamentRecord(tournamentRecord, deepCopyOption);
      return processResult(result);
    },
    removeTournamentRecord: (tournamentId) => {
      const result = removeTournamentRecord(tournamentId);
      return processResult(result);
    },
    removeUnlinkedTournamentRecords: () => {
      const result = removeUnlinkedTournamentRecords();
      return processResult(result);
    },
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

  importGovernors([
    competitionGovernor,
    policyGovernor,
    publishingGovernor,
    queryGovernor,
    scheduleGovernor,
    venueGovernor,
  ]);

  // enable Middleware
  async function engineInvoke(method, params) {
    delete engine.success;
    delete engine.error;

    const tournamentRecords = getTournamentRecords();
    const activeTournamentId = getTournamentId();

    const snapshot =
      params?.rollbackOnError && makeDeepCopy(tournamentRecords, false, true);

    const result = await method({
      activeTournamentId,
      tournamentRecords,
      ...params,
    });

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
      await notifySubscribersAsync({
        directives: [{ method, params }],
        mutationStatus,
      });
    if (notify || !result?.success || params?.doNotNotify) deleteNotices();

    return result;
  }

  async function importGovernors(governors) {
    for (const governor of governors) {
      const govKeys = Object.keys(governor);
      for (const method of govKeys) {
        engine[method] = async function (params) {
          // if devContext is true then don't trap errors
          if (getDevContext()) {
            const engineResult = await engineInvoke(governor[method], params);
            return engineResult;
          } else {
            try {
              const engineResult = await engineInvoke(governor[method], params);
              return engineResult;
            } catch (err) {
              const error = err.toString();
              console.log('ERROR', {
                error,
                method,
                params: JSON.stringify(params),
              });
              console.log(err);
            }
          }
        };
      }
    }
  }

  async function executionQueueAsync(directives, rollbackOnError) {
    if (!Array.isArray(directives)) return { error: INVALID_VALUES };
    const tournamentRecords = getTournamentRecords();
    const activeTournamentId = getTournamentId();

    const snapshot =
      rollbackOnError && makeDeepCopy(tournamentRecords, false, true);

    let timeStamp;
    const result = {};
    const results = [];
    for (const directive of directives) {
      if (typeof directive !== 'object') return { error: INVALID_VALUES };

      const { method, params } = directive;
      if (!engine[method]) return { error: METHOD_NOT_FOUND };

      const result = await engine[method]({
        activeTournamentId,
        tournamentRecords,
        ...params,
      });

      if (result?.error) {
        if (snapshot) setState(snapshot);
        return { ...result, rolledBack: !!snapshot };
      }
      results.push(result);
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
    await notifySubscribersAsync({ directives, mutationStatus, timeStamp });
    deleteNotices();

    return { result, results };
  }

  return engine;
}

export default competitionEngineAsync;
