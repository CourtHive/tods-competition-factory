import scoreGovernor from './governors/scoreGovernor';

import { notifySubscribers } from '../global/state/notifySubscribers';
import { factoryVersion } from '../global/functions/factoryVersion';
import { makeDeepCopy } from '../utilities';
import { setState } from './stateMethods';
import {
  setDeepCopy,
  setDevContext,
  getDevContext,
  deleteNotices,
} from '../global/state/globalState';

import { SUCCESS } from '../constants/resultConstants';

let matchUp;

export const matchUpEngine = (function () {
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

  function importGovernors(governors) {
    governors.forEach((governor) => {
      Object.keys(governor).forEach((governorMethod) => {
        engine[governorMethod] = (params) => {
          if (getDevContext()) {
            return invoke({ params, governor, governorMethod });
          } else {
            try {
              return invoke({ params, governor, governorMethod });
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
      });
    });
  }

  function invoke({ params, governor, governorMethod }) {
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
    if (notify) notifySubscribers();
    if (notify || !result?.success || params?.doNotNotify) deleteNotices();

    return result;
  }
})();

export default matchUpEngine;
