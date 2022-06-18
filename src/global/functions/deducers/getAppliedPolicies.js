import { APPLIED_POLICIES } from '../../../constants/extensionConstants';

export function getAppliedPolicies({
  tournamentRecord,
  drawDefinition,
  structure,
  event,
}) {
  const appliedPolicies = {};

  if (tournamentRecord)
    Object.assign(appliedPolicies, extractAppliedPolicies(tournamentRecord));
  if (event) Object.assign(appliedPolicies, extractAppliedPolicies(event));
  if (drawDefinition)
    Object.assign(appliedPolicies, extractAppliedPolicies(drawDefinition));
  if (structure)
    Object.assign(appliedPolicies, extractAppliedPolicies(structure));

  return { appliedPolicies };

  function extractAppliedPolicies({ extensions }) {
    const appliedPoliciesExtension = extensions?.find(
      (extension) => extension.name === APPLIED_POLICIES
    );
    return appliedPoliciesExtension?.value || {};
  }
}
