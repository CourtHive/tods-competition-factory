import { getAppliedPolicies as getDrawAppliedPolicies } from '../../../drawEngine/governors/policyGovernor/getAppliedPolicies';
import {
  getAppliedPolicies as getTournamentAppliedPolicies,
  getEventAppliedPolicies,
} from '../policyGovernor/getAppliedPolicies';

import {
  MISSING_POLICY_TYPE,
  POLICY_NOT_FOUND,
} from '../../../constants/errorConditionConstants';

/**
 * Discovers policies bottom up from drawDefinition => event => tournamentRecord
 * @param {object} tournamentRecord - optional
 * @param {object} event - optional
 * @param {object} drawDefinition - optional
 * @param {string[]} policyTypes - name of policies to find
 * @returns
 */
export function getPolicyDefinitions({
  tournamentRecord,
  drawDefinition,
  policyTypes = [],
  event,
}) {
  if (!Array.isArray(policyTypes)) return { error: MISSING_POLICY_TYPE };

  // create a policyDefinitions object consisting of policies applied
  // starting with drawDefinition, then even, then tournamentRecord
  // Once a matching policyType has been found higher level policies of the same type are ignored
  const policyDefinitions = {};

  const mapAppliedPolicies = (appliedPolicies) => {
    for (const policyType of policyTypes) {
      const policy = appliedPolicies[policyType];
      if (policy && !policyDefinitions[policyType]) {
        // only add found policy if it doesn't already exist
        policyDefinitions[policyType] = policy;
      }
    }
  };

  if (drawDefinition) {
    const { appliedPolicies } =
      getDrawAppliedPolicies({ drawDefinition }) || {};
    mapAppliedPolicies(appliedPolicies, policyTypes);
  }

  if (event) {
    const { appliedPolicies } = getEventAppliedPolicies({ event }) || {};
    mapAppliedPolicies(appliedPolicies, policyTypes);
  }

  if (tournamentRecord) {
    const { appliedPolicies } =
      getTournamentAppliedPolicies({ tournamentRecord }) || {};
    mapAppliedPolicies(appliedPolicies, policyTypes);
  }

  return Object.keys(policyDefinitions).length
    ? { policyDefinitions }
    : { error: POLICY_NOT_FOUND };
}
