import { getAppliedPolicies } from '../../../query/extensions/getAppliedPolicies';
import {
  addEventExtension,
  removeEventExtension,
} from '../addRemoveExtensions';

import { APPLIED_POLICIES } from '../../../constants/extensionConstants';
import { Event } from '../../../types/tournamentTypes';
import { PolicyDefinitions } from '../../../types/factoryTypes';
import { SUCCESS } from '../../../constants/resultConstants';
import {
  MISSING_EVENT,
  MISSING_POLICY_DEFINITION,
  POLICY_NOT_ATTACHED,
  POLICY_NOT_FOUND,
  MISSING_VALUE,
} from '../../../constants/errorConditionConstants';

type AttachEventPoliciesArgs = {
  policyDefinitions: PolicyDefinitions;
  allowReplacement?: boolean;
  event: Event;
};
export function attachEventPolicies({
  policyDefinitions,
  allowReplacement,
  event,
}: AttachEventPoliciesArgs) {
  if (!event) {
    return { error: MISSING_EVENT };
  }
  if (!policyDefinitions) {
    return { error: MISSING_POLICY_DEFINITION };
  }

  let policiesApplied = 0;
  if (!event.extensions) event.extensions = [];
  const appliedPolicies = getAppliedPolicies({ event }).appliedPolicies ?? {};

  Object.keys(policyDefinitions).forEach((policyType) => {
    if (!appliedPolicies[policyType] || allowReplacement) {
      appliedPolicies[policyType] = policyDefinitions[policyType];
      policiesApplied++;
    }
  });

  if (policiesApplied) {
    const extension = { name: APPLIED_POLICIES, value: appliedPolicies };
    addEventExtension({ event, extension });
  }

  return policiesApplied ? SUCCESS : { error: POLICY_NOT_ATTACHED };
}

export function removeEventPolicy({ event, policyType }) {
  if (!policyType) return { error: MISSING_VALUE };
  if (!event) return { error: MISSING_EVENT };

  let policyRemoved;
  if (event.extensions) {
    const { appliedPolicies } = getAppliedPolicies({ event });
    if (appliedPolicies?.[policyType]) {
      delete appliedPolicies[policyType];
      policyRemoved = true;

      if (Object.keys(appliedPolicies).length) {
        const extension = { name: APPLIED_POLICIES, value: appliedPolicies };
        addEventExtension({ event, extension });
      } else {
        removeEventExtension({ event, name: APPLIED_POLICIES });
      }
    }
  }
  return policyRemoved ? SUCCESS : { error: POLICY_NOT_FOUND };
}
