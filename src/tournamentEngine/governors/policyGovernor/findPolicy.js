import { getAppliedPolicies } from '../../../global/functions/deducers/getAppliedPolicies';

import {
  MISSING_TOURNAMENT_RECORD,
  POLICY_NOT_FOUND,
} from '../../../constants/errorConditionConstants';

export function findPolicy({
  tournamentRecord,
  drawDefinition,
  policyType,
  structure,
  event,
}) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };

  const { appliedPolicies } = getAppliedPolicies({
    tournamentRecord,
    drawDefinition,
    structure,
    event,
  });

  return appliedPolicies?.[policyType]
    ? { policy: appliedPolicies[policyType] }
    : { error: POLICY_NOT_FOUND };
}
