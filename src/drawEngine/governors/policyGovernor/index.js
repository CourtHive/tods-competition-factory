import { addExtension } from '../../../tournamentEngine/governors/tournamentGovernor/addRemoveExtensions';
import { getAppliedPolicies } from './getAppliedPolicies';

import { APPLIED_POLICIES } from '../../../constants/extensionConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import {
  EXISTING_POLICY_TYPE,
  MISSING_DRAW_DEFINITION,
  MISSING_POLICY_DEFINITION,
} from '../../../constants/errorConditionConstants';

function addPolicyProfile({ drawDefinition, policyDefinition }) {
  const errors = [];
  if (!policyDefinition || typeof policyDefinition !== 'object') {
    errors.push({ error: MISSING_POLICY_DEFINITION });
    return { errors };
  }

  if (!drawDefinition.extensions) drawDefinition.extensions = [];
  const { appliedPolicies } = getAppliedPolicies({ drawDefinition });

  const applied = Object.keys(policyDefinition).every((policyType) => {
    if (!appliedPolicies[policyType]) {
      appliedPolicies[policyType] = policyDefinition[policyType];
      return true;
    } else {
      return false;
    }
  });

  if (applied) {
    const extension = {
      name: APPLIED_POLICIES,
      value: appliedPolicies,
    };
    const result = addExtension({ element: drawDefinition, extension });
    if (result.error) return result;
  }

  return !applied ? { error: EXISTING_POLICY_TYPE } : SUCCESS;
}

function attachPolicy({ drawDefinition, policyDefinition }) {
  if (!drawDefinition) {
    return { error: MISSING_DRAW_DEFINITION };
  }
  let result = addPolicyProfile({ drawDefinition, policyDefinition });
  if (result && result.errors) return { error: result.errors };
  return SUCCESS;
}

const policyGovernor = {
  attachPolicy,
};

export default policyGovernor;
