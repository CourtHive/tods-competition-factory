import { findMatchUp } from '../../getters/getMatchUps/findMatchUp';
import { setMatchUpStatus } from './setMatchUpStatus';

import { TEAM_MATCHUP } from '../../../constants/matchUpTypes';
import {
  INVALID_MATCHUP,
  MISSING_DRAW_DEFINITION,
} from '../../../constants/errorConditionConstants';

export function enableTieAutoCalc({
  tournamentRecord,
  drawDefinition,
  matchUpId,
  event,
}) {
  if (!drawDefinition) return { error: MISSING_DRAW_DEFINITION };

  const { matchUp } = findMatchUp({
    drawDefinition,
    matchUpId,
    event,
  });

  if (matchUp?.matchUpType !== TEAM_MATCHUP) return { error: INVALID_MATCHUP };

  return setMatchUpStatus({
    enableAutoCalc: true,
    tournamentRecord,
    drawDefinition,
    matchUpId,
    event,
  });
}
