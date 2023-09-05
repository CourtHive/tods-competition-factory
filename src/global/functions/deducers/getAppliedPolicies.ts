import { makeDeepCopy } from '../../../utilities';

import { APPLIED_POLICIES } from '../../../constants/extensionConstants';
import { PolicyDefinitions } from '../../../types/factoryTypes';
import { SUCCESS } from '../../../constants/resultConstants';
import {
  ErrorType,
  MISSING_POLICY_TYPE,
  POLICY_NOT_FOUND,
} from '../../../constants/errorConditionConstants';
import {
  DrawDefinition,
  Event,
  Structure,
  Tournament,
} from '../../../types/tournamentFromSchema';

type GetAppliedPoliciesArgs = {
  onlySpecifiedPolicyTypes?: boolean;
  tournamentRecord?: Tournament;
  drawDefinition?: DrawDefinition;
  policyTypes?: string[];
  structure?: Structure;
  event?: Event;
};

export function getAppliedPolicies({
  onlySpecifiedPolicyTypes = false,
  policyTypes = [],
  tournamentRecord,
  drawDefinition,
  structure,
  event,
}: GetAppliedPoliciesArgs): {
  appliedPolicies?: PolicyDefinitions;
  error?: ErrorType;
} {
  if (!Array.isArray(policyTypes)) return { error: MISSING_POLICY_TYPE };
  const appliedPolicies = {};

  if (tournamentRecord) extractAppliedPolicies(tournamentRecord);
  if (event) extractAppliedPolicies(event);
  if (drawDefinition) extractAppliedPolicies(drawDefinition);
  if (structure) extractAppliedPolicies(structure);

  return { appliedPolicies, ...SUCCESS };

  function extractAppliedPolicies(params) {
    const extensions = params?.extensions;
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

type GetPolicyDefinitionsArgs = {
  tournamentRecord?: Tournament;
  drawDefinition?: DrawDefinition;
  policyTypes?: string[];
  structure?: Structure;
  event?: Event;
};
export function getPolicyDefinitions({
  policyTypes = [],
  tournamentRecord,
  drawDefinition,
  structure,
  event,
}: GetPolicyDefinitionsArgs): {
  policyDefinitions?: PolicyDefinitions;
  error?: ErrorType;
} {
  if (!Array.isArray(policyTypes)) return { error: MISSING_POLICY_TYPE };

  const { appliedPolicies } = getAppliedPolicies({
    tournamentRecord,
    drawDefinition,
    structure,
    event,
  });

  const policyDefinitions: PolicyDefinitions = {};

  for (const policyType of policyTypes) {
    const policy = appliedPolicies?.[policyType];
    if (policy) policyDefinitions[policyType] = policy;
  }

  return Object.keys(policyDefinitions).length
    ? { policyDefinitions }
    : { error: POLICY_NOT_FOUND };
}
