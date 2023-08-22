import { updateTieMatchUpScore as autoScoreTieMatchUp } from '../../../drawEngine/governors/matchUpGovernor/tieMatchUpScore';

import { MISSING_TOURNAMENT_RECORD } from '../../../constants/errorConditionConstants';

export function updateTieMatchUpScore(params) {
  if (!params.tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  return autoScoreTieMatchUp(params);
}
