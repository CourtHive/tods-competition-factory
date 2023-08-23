import tieFormatGovernor from './governors/tieFormatGovernor';
import historyGovernor from './governors/historyGovernor';
import queryGovernor from './governors/queryGovernor';
import scoreGovernor from './governors/scoreGovernor';

import { notifySubscribersAsync } from '../global/state/notifySubscribers';
import { factoryVersion } from '../global/functions/factoryVersion';
import { makeDeepCopy } from '../utilities';
import {
  setDeepCopy,
  setDevContext,
  getDevContext,
  deleteNotices,
  createInstanceState,
} from '../global/state/globalState';
import {
  getMatchUp,
  getMatchUps,
  getState,
  reset,
  setState,
} from './stateMethods';

import { SUCCESS } from '../constants/resultConstants';
import { FactoryEngine } from '../types/factoryTypes';

export function matchUpEngineAsync(test) {
  const result = createInstanceState();
  if (result.error && !test) return result;

  const engine: FactoryEngine = {
    getState: (params) => getState(params),
    version: () => factoryVersion(),
    reset: () => {
      reset();
      return { ...SUCCESS };
    },
    drawId: undefined,
    error: undefined,
    success: false,
    devContext: (contextCriteria) => {
      setDevContext(contextCriteria);
      return engine;
    },
    setState: (definition, deepCopyOption, deepCopyAttributes) => {
      setDeepCopy(deepCopyOption, deepCopyAttributes);
      const result = setState(definition);
      return processResult(result);
    },
  };

  function processResult(result) {
    if (result?.error) {
      engine.error = result.error;
      engine.success = false;
    } else {
      engine.error = undefined;
      engine.success = true;
      engine.drawId = result.drawId;
    }
    return engine;
  }

  importGovernors([
    tieFormatGovernor,
    historyGovernor,
    queryGovernor,
    scoreGovernor,
  ]);

  return engine;

  async function importGovernors(governors) {
    for (const governor of governors) {
      const governorMethods = Object.keys(governor);

      for (const governorMethod of governorMethods) {
        engine[governorMethod] = async (params) => {
          if (getDevContext()) {
            return await invoke({ params, governor, governorMethod });
          } else {
            try {
              return await invoke({ params, governor, governorMethod });
            } catch (err) {
              let error;
              if (typeof err === 'string') {
                error = err.toUpperCase();
              } else if (err instanceof Error) {
                error = err.message;
              }
              console.log('ERROR', {
                params: JSON.stringify(params),
                method: governorMethod,
                error,
              });
            }
          }
        };
      }
    }
  }

  async function invoke({ params, governor, governorMethod }) {
    engine.success = false;
    engine.error = undefined;

    const matchUp = params?.matchUp || getMatchUp();
    const matchUps = params?.matchUps || getMatchUps();

    const snapshot =
      params?.rollbackOnError && makeDeepCopy(matchUp, false, true);

    params = {
      ...params,
      matchUpId: matchUp?.matchUpId,
      matchUps,
      matchUp,
    };

    const result = governor[governorMethod](params);

    if (result?.error) {
      if (snapshot) setState(snapshot);
      return { ...result, rolledBack: !!snapshot };
    }

    const notify =
      result?.success &&
      params?.delayNotify !== true &&
      params?.doNotNotify !== true;
    if (notify) await notifySubscribersAsync();
    if (notify || !result?.success || params?.doNotNotify) deleteNotices();

    return result;
  }
}

export default matchUpEngineAsync;
