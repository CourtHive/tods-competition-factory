import { notifySubscribers } from '../global/state/notifySubscribers';
import { factoryVersion } from '../global/functions/factoryVersion';
import {
  deleteNotices,
  setDevContext,
  setDeepCopy,
} from '../global/state/globalState';

import amendsGovernor from './governors/amendsGovernor';
import mocksGovernor from './governors/mocksGovernor';

let devContextSet = false;

export const mocksEngine = (function () {
  const engine = {
    version: () => factoryVersion(),
    setDeepCopy: (deepCopyOption, deepCopyAttributes) => {
      setDeepCopy(deepCopyOption, deepCopyAttributes);
      return engine;
    },
    devContext: (isDev) => {
      setDevContext(isDev);
      devContextSet = true;
      return engine;
    },
  };

  importGovernors([amendsGovernor, mocksGovernor]);

  return engine;

  // enable Middleware
  function engineInvoke(method, params) {
    const result = method({ ...params });
    if (!result?.error) notifySubscribers();
    deleteNotices();

    // cleanup if set on invocation
    if (devContextSet) {
      setDevContext(false);
      devContextSet = false;
    }

    return result;
  }

  function importGovernors(governors) {
    governors.forEach((governor) => {
      Object.keys(governor).forEach((method) => {
        engine[method] = (params) => {
          try {
            return engineInvoke(governor[method], params);
          } catch (err) {
            const error = err.toString();
            console.log('ERROR', {
              error,
              method,
              params: JSON.stringify(params),
            });
          }
        };
      });
    });
  }
})();

export default mocksEngine;
