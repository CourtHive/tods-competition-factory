import { deleteNotices, setDevContext } from '../global/globalState';
import { notifySubscribers } from '../global/notifySubscribers';
import mocksGovernor from './governors/mocksGovernor';

export const mocksEngine = (function () {
  const engine = {
    version: () => {
      return '@VERSION@';
    },
    devContext: (isDev) => {
      setDevContext(isDev);
      return engine;
    },
  };

  importGovernors([mocksGovernor]);

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
