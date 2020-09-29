export function getAppliedPolicies({ drawDefinition }) {
  if (!drawDefinition) return { error: 'Missing drawDefinition' };
  const extensions = drawDefinition.extensions || [];
  const appliedPoliciesExtension = extensions.find(
    extension => extension.name === 'appliedPolicies'
  );
  const appliedPolicies = appliedPoliciesExtension?.value || {};
  return { appliedPolicies };
}
