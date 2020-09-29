export function getAppliedPolicies({ tournamentRecord }) {
  if (!tournamentRecord) return { error: 'Missing tournamentRecord' };
  const extensions = tournamentRecord.extensions || [];
  const appliedPoliciesExtension = extensions.find(
    extension => extension.name === 'appliedPolicies'
  );
  const appliedPolicies = appliedPoliciesExtension?.value || {};
  return { appliedPolicies };
}
