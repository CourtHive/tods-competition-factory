import { MISSING_POLICY_TYPE } from '../../../constants/errorConditionConstants';
import { getAppliedPolicies as getDrawAppliedPolicies } from '../../../drawEngine/governors/policyGovernor/getAppliedPolicies';
import {
  getAppliedPolicies as getTournamentAppliedPolicies,
  getEventAppliedPolicies,
} from '../policyGovernor/getAppliedPolicies';

export function getPolicyDefinition({
  tournamentRecord,
  drawDefinition,
  policyType,
  event,
}) {
  if (!policyType) return { error: MISSING_POLICY_TYPE };

  if (drawDefinition) {
    const { appliedPolicies } =
      getDrawAppliedPolicies({ drawDefinition }) || {};
    const policy = appliedPolicies[policyType];
    const policyDefinition = policy && { [policyType]: policy };
    return policyDefinition
      ? { policyDefinition }
      : { error: 'No matching policy found' };
  }

  if (event) {
    const { appliedPolicies } = getEventAppliedPolicies({ event }) || {};
    const policy = appliedPolicies[policyType];
    const policyDefinition = policy && { [policyType]: policy };
    return policyDefinition
      ? { policyDefinition }
      : { error: 'No matching policy found' };
  }

  if (tournamentRecord) {
    const { appliedPolicies } =
      getTournamentAppliedPolicies({ tournamentRecord }) || {};
    const policy = appliedPolicies[policyType];
    const policyDefinition = policy && { [policyType]: policy };
    return policyDefinition
      ? { policyDefinition }
      : { error: 'No matching policy found' };
  }

  return { error: 'Policy not found' };
}
