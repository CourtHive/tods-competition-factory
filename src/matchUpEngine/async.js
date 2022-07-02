import scoreGovernor from './governors/scoreGovernor';

import { notifySubscribersAsync } from '../global/state/notifySubscribers';
import { factoryVersion } from '../global/functions/factoryVersion';
import { makeDeepCopy } from '../utilities';
import { setState } from './stateMethods';
import {
  setDeepCopy,
  setDevContext,
  getDevContext,
  deleteNotices,
  createInstanceState,
} from '../global/state/globalState';

import { SUCCESS } from '../constants/resultConstants';

let matchUp;

export function matchUpEngineAsync(test) {
  const result = createInstanceState();
  if (result.error && !test) return result;

  const engine = {
    getState: ({ convertExtensions, removeExtensions } = {}) => ({
      matchUp: makeDeepCopy(
        matchUp,
        convertExtensions,
        false,
        removeExtensions
      ),
    }),
    version: () => factoryVersion(),
    reset: () => {
      matchUp = undefined;
      return { ...SUCCESS };
    },
  };

  function processResult(result) {
    if (result?.error) {
      engine.error = result.error;
      engine.success = false;
    } else {
      engine.error = undefined;
      engine.success = true;
      matchUp = result;
      engine.drawId = result.drawId;
    }
    return engine;
  }

  importGovernors([scoreGovernor]);

  engine.devContext = (isDev) => {
    setDevContext(isDev);
    return engine;
  };
  engine.setState = (definition, deepCopyOption, deepCopyAttributes) => {
    setDeepCopy(deepCopyOption, deepCopyAttributes);
    const result = setState(definition);
    return processResult(result);
  };

  return engine;

  async function importGovernors(governors) {
    for (const governor of governors) {
      const governorMethods = Object.keys(governor);

      for (const governorMethod of governorMethods) {
        engine[governorMethod] = async (params) => {
          if (getDevContext()) {
            const result = await invoke({ params, governor, governorMethod });

            return result;
          } else {
            try {
              const result = await invoke({ params, governor, governorMethod });

              return result;
            } catch (err) {
              const error = err.toString();
              console.log('ERROR', {
                error,
                method: governorMethod,
                params: JSON.stringify(params),
              });
              console.log(err);
            }
          }
        };
      }
    }
  }

  async function invoke({ params, governor, governorMethod }) {
    delete engine.success;
    delete engine.error;

    const snapshot =
      params?.rollbackOnError && makeDeepCopy(matchUp, false, true);

    params = {
      ...params,
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
