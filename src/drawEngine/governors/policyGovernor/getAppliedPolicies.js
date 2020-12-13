import { MISSING_DRAW_DEFINITION } from '../../../constants/errorConditionConstants';

export function getAppliedPolicies({ drawDefinition }) {
  if (!drawDefinition) return { error: MISSING_DRAW_DEFINITION };
  const extensions = drawDefinition.extensions || [];
  const appliedPoliciesExtension = extensions.find(
    (extension) => extension.name === 'appliedPolicies'
  );
  const appliedPolicies = appliedPoliciesExtension?.value || {};
  return { appliedPolicies };
}
