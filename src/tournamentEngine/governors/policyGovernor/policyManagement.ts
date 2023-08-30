import { getAppliedPolicies } from '../../../global/functions/deducers/getAppliedPolicies';
import {
  addEventExtension,
  addTournamentExtension,
  removeEventExtension,
} from '../tournamentGovernor/addRemoveExtensions';

import { APPLIED_POLICIES } from '../../../constants/extensionConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import { Event, Tournament } from '../../../types/tournamentFromSchema';
import {
  MISSING_EVENT,
  MISSING_POLICY_DEFINITION,
  MISSING_TOURNAMENT_RECORD,
  EXISTING_POLICY_TYPE,
  POLICY_NOT_ATTACHED,
  POLICY_NOT_FOUND,
  MISSING_VALUE,
  ErrorType,
} from '../../../constants/errorConditionConstants';

type AttachPoliciesArgs = {
  tournamentRecord: Tournament;
  allowReplacement?: boolean;
  policyDefinitions: any;
};
export function attachPolicies({
  tournamentRecord,
  policyDefinitions,
  allowReplacement,
}: AttachPoliciesArgs): {
  success?: boolean;
  error?: ErrorType;
  applied?: any;
} {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!policyDefinitions || typeof policyDefinitions !== 'object') {
    return { error: MISSING_POLICY_DEFINITION };
  }

  if (!tournamentRecord.extensions) tournamentRecord.extensions = [];
  const { appliedPolicies } = getAppliedPolicies({ tournamentRecord });

  const applied = Object.keys(policyDefinitions)
    .map((policyType) => {
      if (!appliedPolicies[policyType] || allowReplacement) {
        appliedPolicies[policyType] = policyDefinitions[policyType];
        return policyType;
      }
      return undefined;
    })
    .filter(Boolean);

  if (applied?.length) {
    const extension = {
      name: APPLIED_POLICIES,
      value: appliedPolicies,
    };
    const result = addTournamentExtension({ tournamentRecord, extension });
    if (result.error) return result;
  }

  return !applied?.length
    ? { error: EXISTING_POLICY_TYPE }
    : { ...SUCCESS, applied };
}

type AttachEventPoliciesArgs = {
  allowReplacement?: boolean;
  policyDefinitions: any;
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
  const { appliedPolicies } = getAppliedPolicies({ event });

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
