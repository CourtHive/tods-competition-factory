import {
  MISSING_EVENT,
  MISSING_TOURNAMENT_RECORD,
} from '../../../constants/errorConditionConstants';

export function getAppliedPolicies({ tournamentRecord }) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  const extensions = tournamentRecord.extensions || [];
  return extractAppliedPolicies({ extensions });
}

export function getEventAppliedPolicies({ event }) {
  if (!event) return { error: MISSING_EVENT };
  const extensions = event.extensions || [];
  const extract = extractAppliedPolicies({ extensions });
  return { appliedPolicies: extract?.appliedPolicies, error: extract?.error };
}

function extractAppliedPolicies({ extensions }) {
  const appliedPoliciesExtension = extensions.find(
    (extension) => extension.name === 'appliedPolicies'
  );
  const appliedPolicies = appliedPoliciesExtension?.value || {};
  return { appliedPolicies };
}
