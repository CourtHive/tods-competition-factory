import { MISSING_TOURNAMENT_RECORD } from '../../../constants/errorConditionConstants';
import {
  POLICY_TYPE_SCORING,
  POLICY_TYPE_DRAWS,
} from '../../../constants/policyConstants';
import { getAppliedPolicies } from './getAppliedPolicies';

export function allowedMatchUpFormats({ tournamentRecord }) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  const { appliedPolicies } = getAppliedPolicies({ tournamentRecord });
  const scoringPolicy = appliedPolicies && appliedPolicies[POLICY_TYPE_SCORING];
  return scoringPolicy?.allowedMatchUpFormats;
}

export function allowedDrawTypes({ tournamentRecord }) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  const { appliedPolicies } = getAppliedPolicies({ tournamentRecord });
  const drawTypesPolicy = appliedPolicies && appliedPolicies[POLICY_TYPE_DRAWS];
  return drawTypesPolicy?.allowedDrawTypes;
}
