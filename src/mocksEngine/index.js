import { setDevContext } from '../global/globalState';
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
    return fx({ ...params });
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
