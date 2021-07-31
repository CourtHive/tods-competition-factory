import { deleteNotices, setDevContext } from '../global/globalState';
import { notifySubscribers } from '../global/notifySubscribers';
import mocksGovernor from './governors/mocksGovernor';

export const mocksEngine = (function () {
  const fx = {
    version: () => {
      return '@VERSION@';
    },
    devContext: (isDev) => {
      setDevContext(isDev);
      return fx;
    },
  };

  importGovernors([mocksGovernor]);

  return fx;

  // enable Middleware
  function engineInvoke(fx, params) {
    const result = fx({ ...params });
    if (!result?.error) notifySubscribers();
    deleteNotices();
    return result;
  }

  function importGovernors(governors) {
    governors.forEach((governor) => {
      Object.keys(governor).forEach((key) => {
        fx[key] = (params) => {
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
