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
  if (!policyType) return { error: 'Missing policyType' };

  if (drawDefinition) {
    const { appliedPolicies } =
      getDrawAppliedPolicies({ drawDefinition }) || {};
    const policy = appliedPolicies[policyType];
    return policy && { policyDefinition: { [policyType]: policy } };
  }

  if (event) {
    const { appliedPolicies } = getEventAppliedPolicies({ event }) || {};
    const policy = appliedPolicies[policyType];
    return policy && { policyDefinition: { [policyType]: policy } };
  }

  if (tournamentRecord) {
    const { appliedPolicies } =
      getTournamentAppliedPolicies({ tournamentRecord }) || {};
    const policy = appliedPolicies[policyType];
    return policy && { policyDefinition: { [policyType]: policy } };
  }

  return { error: 'Policy not found' };
}
