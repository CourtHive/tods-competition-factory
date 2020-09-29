import { getAppliedPolicies } from './getAppliedPolicies';

export function allowedScoringFormats({ tournamentRecord }) {
  if (!tournamentRecord) return { error: 'Missing tournamentRecord' };
  const { appliedPolicies } = getAppliedPolicies({ tournamentRecord });
  return appliedPolicies?.scoring?.allowedScoringFormats;
}

export function allowedDrawTypes({ tournamentRecord }) {
  if (!tournamentRecord) return { error: 'Missing tournamentRecord' };
  const { appliedPolicies } = getAppliedPolicies({ tournamentRecord });
  return appliedPolicies?.draws?.allowedDrawTypes;
}
