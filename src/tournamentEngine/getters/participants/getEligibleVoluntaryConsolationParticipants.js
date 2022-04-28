import { getEligibleVoluntaryConsolationParticipants as getEligible } from '../../../drawEngine/governors/queryGovernor/getEligibleVoluntaryConsolationParticipants';

import { MISSING_TOURNAMENT_RECORD } from '../../../constants/errorConditionConstants';

export function getEligibleVoluntaryConsolationParticipants(params) {
  if (!params.tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  return getEligible(params);
}
