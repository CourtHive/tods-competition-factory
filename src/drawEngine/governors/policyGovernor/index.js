import policyTemplate from './policyDefinitionTemplate';
import { getAppliedPolicies } from './getAppliedPolicies';
import { SUCCESS } from '../../../constants/resultConstants';
import {
  INVALID_OBJECT,
  EXISTING_POLICY_TYPE,
  MISSING_DRAW_DEFINITION,
  MISSING_POLICY_DEFINITION,
  INVALID_POLICY_DEFINITION,
} from '../../../constants/errorConditionConstants';

function addPolicyProfile({ drawDefinition, policyDefinition }) {
  const errors = [];
  if (!policyDefinition || typeof policyDefinition !== 'object') {
    errors.push({ error: MISSING_POLICY_DEFINITION });
    return { errors };
  }

  if (!drawDefinition.extensions) drawDefinition.extensions = [];
  const { appliedPolicies } = getAppliedPolicies({ drawDefinition });

  Object.keys(policyDefinition).forEach(policyType => {
    if (!appliedPolicies[policyType]) {
      appliedPolicies[policyType] = policyDefinition[policyType];
    } else {
      errors.push({ error: EXISTING_POLICY_TYPE });
    }
  });

  if (!errors.length) {
    drawDefinition.extensions = drawDefinition.extensions.filter(
      extension => extension.name !== 'appliedPolicies'
    );
    drawDefinition.extensions.push({
      name: 'appliedPolicies',
      value: appliedPolicies,
    });
  }

  return errors.length ? errors : SUCCESS;
}

function addPolicy({ policies, policyDefinition }) {
  if (typeof policyDefinition !== 'object') return { error: INVALID_OBJECT };
  if (!validDefinitionKeys(policyDefinition))
    return { error: INVALID_POLICY_DEFINITION };
  Object.assign(policies, policyDefinition);
  return SUCCESS;
}

function attachPolicy({ drawDefinition, policies, policyDefinition }) {
  if (!drawDefinition) {
    return { error: MISSING_DRAW_DEFINITION };
  }
  let result = addPolicy({ policies, policyDefinition });
  if (result && result.errors) return { error: result.errors };
  result = addPolicyProfile({ drawDefinition, policyDefinition });
  if (result && result.errors) return { error: result.errors };
  return SUCCESS;
}

function validDefinitionKeys(definition) {
  const definitionKeys = Object.keys(definition);
  const validKeys = Object.keys(policyTemplate());
  const valid = definitionKeys.reduce(
    (p, key) => (!validKeys.includes(key) ? false : p),
    true
  );
  return valid;
}

const policyGovernor = {
  attachPolicy,
};

export default policyGovernor;
