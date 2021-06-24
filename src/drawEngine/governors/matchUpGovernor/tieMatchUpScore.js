import { generateTieMatchUpScore } from '../../accessors/matchUpAccessor';
import { findMatchUp } from '../../getters/getMatchUps/findMatchUp';
import { modifyMatchUpScore } from './modifyMatchUpScore';

import {
  MATCHUP_NOT_FOUND,
  MISSING_DRAW_DEFINITION,
  MISSING_MATCHUP,
} from '../../../constants/errorConditionConstants';
import { SUCCESS } from '../../../constants/resultConstants';

export function updateTieMatchUpScore({ drawDefinition, matchUpId }) {
  if (!drawDefinition) return { error: MISSING_DRAW_DEFINITION };
  if (!matchUpId) return { error: MISSING_MATCHUP };

  const { matchUp, error } = findMatchUp({ drawDefinition, matchUpId });
  if (error) return { error };
  if (!matchUp) return { error: MATCHUP_NOT_FOUND };

  const { winningSide, set, scoreStringSide1, scoreStringSide2 } =
    generateTieMatchUpScore({ matchUp });

  const scoreObject = {
    sets: [set],
    winningSide,
    scoreStringSide1,
    scoreStringSide2,
  };

  modifyMatchUpScore({
    drawDefinition,
    matchUp,
    score: scoreObject,
  });

  return SUCCESS;
}
