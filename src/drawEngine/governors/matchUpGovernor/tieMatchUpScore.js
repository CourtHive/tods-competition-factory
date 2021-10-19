import { generateTieMatchUpScore } from '../../accessors/matchUpAccessor';
import { findMatchUp } from '../../getters/getMatchUps/findMatchUp';
import { modifyMatchUpScore } from './modifyMatchUpScore';

import { SUCCESS } from '../../../constants/resultConstants';
import {
  COMPLETED,
  IN_PROGRESS,
  TO_BE_PLAYED,
} from '../../../constants/matchUpStatusConstants';

export function updateTieMatchUpScore({
  drawDefinition,
  matchUpId,
  structure,
  event,
}) {
  const result = findMatchUp({ drawDefinition, event, matchUpId });
  if (result.error) return result;

  const matchUp = result.matchUp;

  const tieFormat =
    matchUp.tieFormat ||
    structure?.tieFormat ||
    drawDefinition?.tieFormat ||
    event?.tieFormat;

  const { winningSide, set, scoreStringSide1, scoreStringSide2 } =
    generateTieMatchUpScore({ matchUp, tieFormat });

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
    matchUpId,
    matchUp,
    event,
  });

  return { ...SUCCESS, removeWinningSide };
}
