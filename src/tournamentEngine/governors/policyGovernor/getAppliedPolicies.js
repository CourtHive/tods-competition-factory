import { APPLIED_POLICIES } from '../../../constants/extensionConstants';

export function getAppliedPolicies({ tournamentRecord }) {
  const extensions = tournamentRecord?.extensions || [];
  return extractAppliedPolicies({ extensions });
}

function extractAppliedPolicies({ extensions }) {
  const appliedPoliciesExtension = extensions.find(
    (extension) => extension.name === APPLIED_POLICIES
  );
  const appliedPolicies = appliedPoliciesExtension?.value || {};
  return { appliedPolicies };
}
