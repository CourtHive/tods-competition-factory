import { getAppliedPolicies as getDrawAppliedPolicies } from '../../../drawEngine/governors/policyGovernor/getAppliedPolicies';
import {
  getAppliedPolicies as getTournamentAppliedPolicies,
  getEventAppliedPolicies,
} from '../policyGovernor/getAppliedPolicies';

import {
  MISSING_POLICY_TYPE,
  POLICY_NOT_FOUND,
} from '../../../constants/errorConditionConstants';

export function getPolicyDefinitions({
  tournamentRecord,
  drawDefinition,
  policyTypes = [],
  event,
}) {
  if (!Array.isArray(policyTypes)) return { error: MISSING_POLICY_TYPE };

  if (drawDefinition) {
    const { appliedPolicies } =
      getDrawAppliedPolicies({ drawDefinition }) || {};
    const policyDefinitions = mapTargetPolicies(appliedPolicies, policyTypes);
    if (Object.keys(policyDefinitions).length) return { policyDefinitions };
  }

  if (event) {
    const { appliedPolicies } = getEventAppliedPolicies({ event }) || {};
    const policyDefinitions = mapTargetPolicies(appliedPolicies, policyTypes);
    if (Object.keys(policyDefinitions).length) return { policyDefinitions };
  }

  if (tournamentRecord) {
    const { appliedPolicies } =
      getTournamentAppliedPolicies({ tournamentRecord }) || {};
    const policyDefinitions = mapTargetPolicies(appliedPolicies, policyTypes);
    if (Object.keys(policyDefinitions).length) return { policyDefinitions };
  }

  return { error: POLICY_NOT_FOUND };

  function mapTargetPolicies(appliedPolicies, policyTypes) {
    return Object.assign(
      {},
      ...policyTypes
        .map((policyType) => {
          const policy = appliedPolicies[policyType];
          return policy && { [policyType]: policy };
        })
        .filter(Boolean)
    );
  }
}
