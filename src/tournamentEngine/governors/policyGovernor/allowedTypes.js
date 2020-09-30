import { getAppliedPolicies } from './getAppliedPolicies';

export function allowedMatchUpFormats({ tournamentRecord }) {
  if (!tournamentRecord) return { error: 'Missing tournamentRecord' };
  const { appliedPolicies } = getAppliedPolicies({ tournamentRecord });
  return appliedPolicies?.scoring?.allowedMatchUpFormats;
}

export function allowedDrawTypes({ tournamentRecord }) {
  if (!tournamentRecord) return { error: 'Missing tournamentRecord' };
  const { appliedPolicies } = getAppliedPolicies({ tournamentRecord });
  return appliedPolicies?.draws?.allowedDrawTypes;
}
