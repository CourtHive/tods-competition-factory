import { generateTieMatchUpScore } from '../../accessors/matchUpAccessor';
import { findMatchUp } from '../../getters/getMatchUps/findMatchUp';
import { modifyMatchUpScore } from './modifyMatchUpScore';

import { SUCCESS } from '../../../constants/resultConstants';
import {
  MATCHUP_NOT_FOUND,
  MISSING_DRAW_DEFINITION,
  MISSING_MATCHUP,
} from '../../../constants/errorConditionConstants';
import {
  COMPLETED,
  IN_PROGRESS,
  TO_BE_PLAYED,
} from '../../../constants/matchUpStatusConstants';

export function updateTieMatchUpScore({ drawDefinition, matchUpId }) {
  if (!drawDefinition) return { error: MISSING_DRAW_DEFINITION };
  if (!matchUpId) return { error: MISSING_MATCHUP };

  const { matchUp, error } = findMatchUp({ drawDefinition, matchUpId });
  if (error) return { error };
  if (!matchUp) return { error: MATCHUP_NOT_FOUND };

  const { winningSide, set, scoreStringSide1, scoreStringSide2 } =
    generateTieMatchUpScore({ matchUp });

  const hasWinner = [1, 2].includes(winningSide);
  const matchUpStatus = hasWinner
    ? COMPLETED
    : scoreStringSide1
    ? IN_PROGRESS
    : TO_BE_PLAYED;

  const removeWinningSide = matchUp.winningSide && !hasWinner;

  const scoreObject = {
    scoreStringSide1,
    scoreStringSide2,
    sets: [set],
  };

  modifyMatchUpScore({
    score: scoreObject,
    removeWinningSide,
    drawDefinition,
    matchUpStatus,
    winningSide,
    matchUp,
  });

  return { ...SUCCESS, removeWinningSide };
}
