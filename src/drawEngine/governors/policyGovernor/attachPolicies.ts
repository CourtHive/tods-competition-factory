import { getAppliedPolicies } from '../../../global/functions/deducers/getAppliedPolicies';
import { addExtension } from '../../../global/functions/producers/addExtension';
import { modifyDrawNotice } from '../../notifications/drawNotifications';

import { APPLIED_POLICIES } from '../../../constants/extensionConstants';
import { ResultType } from '../../../global/functions/decorateResult';
import { DrawDefinition } from '../../../types/tournamentFromSchema';
import { PolicyDefinitions } from '../../../types/factoryTypes';
import { SUCCESS } from '../../../constants/resultConstants';
import {
  POLICY_TYPE_DISPLAY,
  POLICY_TYPE_ROUND_NAMING,
} from '../../../constants/policyConstants';
import {
  EXISTING_POLICY_TYPE,
  MISSING_DRAW_DEFINITION,
  MISSING_POLICY_DEFINITION,
} from '../../../constants/errorConditionConstants';

type AttachPoliciesArgs = {
  policyDefinitions: PolicyDefinitions;
  drawDefinition: DrawDefinition;
};

export function attachPolicies({
  drawDefinition,
  policyDefinitions,
}: AttachPoliciesArgs): ResultType {
  if (!drawDefinition) {
    return { error: MISSING_DRAW_DEFINITION };
  }
  if (!policyDefinitions || typeof policyDefinitions !== 'object') {
    return { error: MISSING_POLICY_DEFINITION };
  }

  if (!drawDefinition.extensions) drawDefinition.extensions = [];
  const appliedPolicies =
    getAppliedPolicies({ drawDefinition })?.appliedPolicies ?? {};

  const validReplacements = [POLICY_TYPE_ROUND_NAMING, POLICY_TYPE_DISPLAY];

  const applied = Object.keys(policyDefinitions).every((policyType) => {
    if (
      !appliedPolicies[policyType] ||
      validReplacements.includes(policyType)
    ) {
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
