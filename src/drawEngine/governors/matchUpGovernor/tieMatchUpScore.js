import { generateTieMatchUpScoreString } from '../../accessors/matchUpAccessor';
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

  const matchUp = findMatchUp({ drawDefinition, matchUpId });
  if (!matchUp) return { error: MATCHUP_NOT_FOUND };

  const scoreString = generateTieMatchUpScoreString({ matchUp });
  const scoreObject = {};
  const { winningSide } = matchUp;
  const reverseScoreString = scoreString.split('-').reverse().join('-');

  if (winningSide) {
    const winnerPerspective = scoreString;
    const loserPerspective = reverseScoreString;
    scoreObject.scoreStringSide1 =
      winningSide === 1 ? winnerPerspective : loserPerspective;
    scoreObject.scoreStringSide2 =
      winningSide === 2 ? winnerPerspective : loserPerspective;
  } else {
    scoreObject.scoreStringSide1 = scoreString;
    scoreObject.scoreStringSide2 = reverseScoreString;
  }

  modifyMatchUpScore({
    drawDefinition,
    matchUp,
    score: scoreObject,
  });

  return SUCCESS;
}
