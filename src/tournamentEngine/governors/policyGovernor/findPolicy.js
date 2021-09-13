import {
  getAppliedPolicies,
  getEventAppliedPolicies,
} from './getAppliedPolicies';

import {
  MISSING_TOURNAMENT_RECORD,
  POLICY_NOT_FOUND,
} from '../../../constants/errorConditionConstants';

export function findPolicy({ tournamentRecord, event, policyType }) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };

  if (event) {
    const { appliedPolicies } = getEventAppliedPolicies({
      event,
    });
    if (appliedPolicies && appliedPolicies[policyType])
      return { policy: appliedPolicies[policyType] };
  }

  const { appliedPolicies } = getAppliedPolicies({
    tournamentRecord,
  });

  return appliedPolicies?.[policyType]
    ? { policy: appliedPolicies[policyType] }
    : { error: POLICY_NOT_FOUND };
}
