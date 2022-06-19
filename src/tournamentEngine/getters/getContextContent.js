import { getPolicyDefinitions } from '../../global/functions/deducers/getAppliedPolicies';

import POLICY_COMPETITIVE_BANDS_DEFAULT from '../../fixtures/policies/POLICY_COMPETITIVE_BANDS_DEFAULT';
import { POLICY_TYPE_COMPETITIVE_BANDS } from '../../constants/policyConstants';

export function getContextContent({
  policyDefinitions,
  tournamentRecord,
  contextProfile,
  drawDefinition,
  event,
}) {
  const contextContent = { policies: {} };

  if (!contextProfile) return contextContent;

  const policies = getPolicyDefinitions({
    tournamentRecord,
    drawDefinition,
    event,
  });

  if (contextProfile.withCompetitiveness) {
    const policy =
      policyDefinitions?.[POLICY_TYPE_COMPETITIVE_BANDS] ||
      policies?.[POLICY_TYPE_COMPETITIVE_BANDS] ||
      POLICY_COMPETITIVE_BANDS_DEFAULT[POLICY_TYPE_COMPETITIVE_BANDS];

    contextContent.policies[POLICY_TYPE_COMPETITIVE_BANDS] = policy;
  }

  return contextContent;
}
