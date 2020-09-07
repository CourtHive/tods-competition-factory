import { makeDeepCopy } from 'src/utilities';
import { SUCCESS } from 'src/constants/resultConstants';
import seedingGovernor from './governors/seedingGovernor';
import scoringGovernor from './governors/scoringGovernor';
import policyTemplate from './generators/policyDefinitionTemplate';

let devContext;
let policies = {};

export const policyEngine = function() {
  let fx = {};

  fx.loadPolicy = definition => {
    if (typeof definition !== 'object') return { error: 'Invalid Object' };
    if (!validDefinitionKeys(definition)) return { error: 'Invalid Definition' };
    Object.assign(policies, definition);
    return SUCCESS;
  };
  
  fx.getState = () => makeDeepCopy(policies);
  fx.devContext = (isDev) => { devContext = isDev; return fx; }
  
  fx.reset = () => {
    policies = {};
    return SUCCESS;
  }
  
  importGovernors([
    seedingGovernor,
    scoringGovernor
  ]);

  return fx;
  
  function validDefinitionKeys(definition) {
    const definitionKeys = Object.keys(definition);
    const validKeys = Object.keys(policyTemplate());
    const valid = definitionKeys
      .reduce((p, key) => !validKeys.includes(key) ? false : p, true);
    return valid;
  }
 
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
    return governor[key]({ ...params, policies });
  }
  
}();

export default policyEngine;
