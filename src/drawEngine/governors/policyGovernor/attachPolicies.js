import { addExtension } from '../../../tournamentEngine/governors/tournamentGovernor/addRemoveExtensions';
import { modifyDrawNotice } from '../../notifications/drawNotifications';
import { getAppliedPolicies } from './getAppliedPolicies';

import { APPLIED_POLICIES } from '../../../constants/extensionConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import {
  EXISTING_POLICY_TYPE,
  MISSING_DRAW_DEFINITION,
  MISSING_POLICY_DEFINITION,
} from '../../../constants/errorConditionConstants';

export function attachPolicies({ drawDefinition, policyDefinitions }) {
  if (!drawDefinition) {
    return { error: MISSING_DRAW_DEFINITION };
  }
  if (!policyDefinitions || typeof policyDefinitions !== 'object') {
    return { error: MISSING_POLICY_DEFINITION };
  }

  if (!drawDefinition.extensions) drawDefinition.extensions = [];
  const { appliedPolicies } = getAppliedPolicies({ drawDefinition });

  const applied = Object.keys(policyDefinitions).every((policyType) => {
    if (!appliedPolicies[policyType]) {
      appliedPolicies[policyType] = policyDefinitions[policyType];
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

  modifyDrawNotice({ drawDefinition });
  return !applied ? { error: EXISTING_POLICY_TYPE } : { ...SUCCESS };
}
