import { generateTieMatchUpScore } from '../../generators/generateTieMatchUpScore';
import { findMatchUp } from '../../getters/getMatchUps/findMatchUp';
import { isActiveMatchUp } from '../../getters/activeMatchUp';
import { modifyMatchUpScore } from './modifyMatchUpScore';

import { SUCCESS } from '../../../constants/resultConstants';
import {
  COMPLETED,
  IN_PROGRESS,
  TO_BE_PLAYED,
} from '../../../constants/matchUpStatusConstants';

export function updateTieMatchUpScore({
  tournamentRecord,
  drawDefinition,
  matchUpStatus,
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
    event?.tieFormat ||
    undefined;

  matchUp.tieFormat = tieFormat;

  const { winningSide, set, scoreStringSide1, scoreStringSide2 } =
    generateTieMatchUpScore({ matchUp });

  const scoreObject = {
    scoreStringSide1,
    scoreStringSide2,
    sets: [set],
  };
  matchUp.score = scoreObject;

  const hasWinner = [1, 2].includes(winningSide);
  const newMatchUpStatus = hasWinner
    ? COMPLETED
    : isActiveMatchUp({
        matchUpStatus: matchUpStatus || matchUp.matchUpStatus,
        tieMatchUps: matchUp.tieMatchUps,
        winningSide: matchUp.winningSide,
        score: scoreObject,
      })
    ? IN_PROGRESS
    : TO_BE_PLAYED;

  const removeWinningSide = matchUp.winningSide && !hasWinner;

  modifyMatchUpScore({
    matchUpStatus: newMatchUpStatus,
    score: scoreObject,
    removeWinningSide,
    tournamentRecord,
    drawDefinition,
    winningSide,
    matchUpId,
    matchUp,
    event,
  });

  return { ...SUCCESS, removeWinningSide };
}
