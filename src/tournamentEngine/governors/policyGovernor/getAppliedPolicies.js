import {
  MISSING_EVENT,
  MISSING_TOURNAMENT_RECORD,
} from '../../../constants/errorConditionConstants';
import { APPLIED_POLICIES } from '../../../constants/extensionConstants';

export function getAppliedPolicies({ tournamentRecord }) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  const extensions = tournamentRecord.extensions || [];
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
