import { MISSING_DRAW_DEFINITION } from '../../../constants/errorConditionConstants';
import { APPLIED_POLICIES } from '../../../constants/extensionConstants';

export function getAppliedPolicies({ drawDefinition }) {
  if (!drawDefinition) return { error: MISSING_DRAW_DEFINITION };
  const extensions = drawDefinition.extensions || [];
  const appliedPoliciesExtension = extensions.find(
    (extension) => extension.name === APPLIED_POLICIES
  );
  const appliedPolicies = appliedPoliciesExtension?.value || {};
  return { appliedPolicies };
}
