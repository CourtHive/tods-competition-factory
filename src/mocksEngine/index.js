import { deleteNotices, setDevContext } from '../global/state/globalState';
import { notifySubscribers } from '../global/state/notifySubscribers';
import { factoryVersion } from '../global/functions/factoryVersion';

import amendsGovernor from './governors/amendsGovernor';
import mocksGovernor from './governors/mocksGovernor';

export const mocksEngine = (function () {
  const engine = {
    version: () => factoryVersion(),
    devContext: (isDev) => {
      setDevContext(isDev);
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
    return result;
  }

  function importGovernors(governors) {
    governors.forEach((governor) => {
      Object.keys(governor).forEach((key) => {
        engine[key] = (params) => {
          try {
            return engineInvoke(governor[key], params);
          } catch (err) {
            console.log('%c ERROR', 'color: orange', { err });
          }
        };
      });
    });
  }
})();

export default mocksEngine;
