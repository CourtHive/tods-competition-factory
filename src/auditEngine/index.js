import { makeDeepCopy } from '../utilities/makeDeepCopy';
import itemGovernor from './governors/itemGovernor';

let devContext;
let auditTrail = [];

export const auditEngine = function() {
  let fx = {};

  fx.reset = () => auditTrail = [];
  fx.getState = () => makeDeepCopy(auditTrail);
  fx.devContext = (isDev) => { devContext = isDev; return fx; }
  
  importGovernors([
    itemGovernor
  ]);

  return fx;
  
  function importGovernors(governors) {
    governors.forEach(governor => {
      Object.keys(governor)
        .forEach(key => {
          fx[key] = params => {
            if (devContext) {
              return invoke({params, governor, key});
            } else {
              try { return invoke({params, governor, key}); }
              catch (err) { console.log('%c ERROR', 'color: orange', {err}); }
            }
          }
        });
    });
  }

  function invoke({params, governor, key}) {
    return governor[key]({ ...params, auditTrail });
  }
  
}();

export default auditEngine;
