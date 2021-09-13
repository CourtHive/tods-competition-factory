import { MISSING_EVENT } from '../../../constants/errorConditionConstants';
import { APPLIED_POLICIES } from '../../../constants/extensionConstants';

export function getAppliedPolicies({ tournamentRecord }) {
  const extensions = tournamentRecord?.extensions || [];
  return extractAppliedPolicies({ extensions });
}

export function getEventAppliedPolicies({ event }) {
  if (!event) return { error: MISSING_EVENT };
  const extensions = event.extensions || [];
  return extractAppliedPolicies({ extensions });
}

function extractAppliedPolicies({ extensions }) {
  const appliedPoliciesExtension = extensions.find(
    (extension) => extension.name === APPLIED_POLICIES
  );
  const appliedPolicies = appliedPoliciesExtension?.value || {};
  return { appliedPolicies };
}
