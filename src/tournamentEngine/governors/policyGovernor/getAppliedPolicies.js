export function getAppliedPolicies({ tournamentRecord }) {
  if (!tournamentRecord) return { error: 'Missing tournamentRecord' };
  const extensions = tournamentRecord.extensions || [];
  return extractAppliedPolicies({ extensions });
}

export function getEventAppliedPolicies({ event }) {
  if (!event) return { error: 'Missing event' };
  const extensions = event.extensions || [];
  const extract = extractAppliedPolicies({ extensions });
  return { appliedPolicies: extract?.appliedPolicies, error: extract?.error };
}

function extractAppliedPolicies({ extensions }) {
  const appliedPoliciesExtension = extensions.find(
    extension => extension.name === 'appliedPolicies'
  );
  const appliedPolicies = appliedPoliciesExtension?.value || {};
  return { appliedPolicies };
}
