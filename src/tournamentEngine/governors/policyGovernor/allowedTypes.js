import { MISSING_TOURNAMENT_RECORD } from '../../../constants/errorConditionConstants';
import { getAppliedPolicies } from './getAppliedPolicies';

export function allowedMatchUpFormats({ tournamentRecord }) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  const { appliedPolicies } = getAppliedPolicies({ tournamentRecord });
  return appliedPolicies?.scoring?.allowedMatchUpFormats;
}

export function allowedDrawTypes({ tournamentRecord }) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  const { appliedPolicies } = getAppliedPolicies({ tournamentRecord });
  return appliedPolicies?.draws?.allowedDrawTypes;
}
