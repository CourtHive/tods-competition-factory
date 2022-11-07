import { makeDeepCopy } from '../../../utilities';

import { APPLIED_POLICIES } from '../../../constants/extensionConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import {
  MISSING_POLICY_TYPE,
  POLICY_NOT_FOUND,
} from '../../../constants/errorConditionConstants';

/**
 * Discovers policies bottom up from drawDefinition => event => tournamentRecord
 * @param {string[]} policyTypes - name of policies to find
 * @param {object} tournamentRecord - optional
 * @param {object} drawDefinition - optional
 * @param {object} structure - optional
 * @param {object} event - optional
 * @returns
 */
export function getAppliedPolicies({
  onlySpecifiedPolicyTypes = false,
  policyTypes = [],
  tournamentRecord,
  drawDefinition,
  structure,
  event,
}) {
  if (!Array.isArray(policyTypes)) return { error: MISSING_POLICY_TYPE };
  const appliedPolicies = {};

  if (tournamentRecord) extractAppliedPolicies(tournamentRecord);
  if (event) extractAppliedPolicies(event);
  if (drawDefinition) extractAppliedPolicies(drawDefinition);
  if (structure) extractAppliedPolicies(structure);

  return { appliedPolicies, ...SUCCESS };

  function extractAppliedPolicies({ extensions }) {
    const extensionPolicies = extensions?.find(
      (extension) => extension.name === APPLIED_POLICIES
    )?.value;
    if (extensionPolicies) {
      for (const key of Object.keys(extensionPolicies))
        if (
          onlySpecifiedPolicyTypes
            ? policyTypes.includes(key)
            : !policyTypes.length || policyTypes.includes(key)
        ) {
          appliedPolicies[key] = makeDeepCopy(
            extensionPolicies[key],
            false,
            true
          );
        }
    }
  }
}

export function getPolicyDefinitions({
  policyTypes = [],
  tournamentRecord,
  drawDefinition,
  structure,
  event,
}) {
  if (!Array.isArray(policyTypes)) return { error: MISSING_POLICY_TYPE };

  const { appliedPolicies } = getAppliedPolicies({
    tournamentRecord,
    drawDefinition,
    structure,
    event,
  });

  const policyDefinitions = {};

  for (const policyType of policyTypes) {
    const policy = appliedPolicies[policyType];
    if (policy) policyDefinitions[policyType] = policy;
  }

  return Object.keys(policyDefinitions).length
    ? { policyDefinitions }
    : { error: POLICY_NOT_FOUND };
}
