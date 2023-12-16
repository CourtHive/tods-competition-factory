import { updateTieMatchUpScore as autoScoreTieMatchUp } from '../../../mutate/matchUps/score/tieMatchUpScore';

import { MISSING_TOURNAMENT_RECORD } from '../../../constants/errorConditionConstants';

export function updateTieMatchUpScore(params) {
  if (!params.tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  return autoScoreTieMatchUp(params);
}
