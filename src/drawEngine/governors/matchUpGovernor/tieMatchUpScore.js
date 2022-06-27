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
  exitWhenNoValues,
  tournamentRecord,
  drawDefinition,
  matchUpStatus,
  removeScore,
  matchUpId,
  event,
}) {
  const result = findMatchUp({ drawDefinition, event, matchUpId });
  if (result.error) return result;

  const { matchUp, structure } = result;

  const tieFormat =
    matchUp.tieFormat ||
    structure?.tieFormat ||
    drawDefinition?.tieFormat ||
    event?.tieFormat ||
    undefined;

  matchUp.tieFormat = tieFormat;

  const { winningSide, set, scoreStringSide1, scoreStringSide2 } =
    generateTieMatchUpScore({ matchUp });

  const setHasValue = set?.side1Score || set?.side2Score;
  if (exitWhenNoValues && !matchUp.score && !setHasValue) {
    return { ...SUCCESS };
  }

  const scoreObject = {
    scoreStringSide1,
    scoreStringSide2,
    sets: set ? [set] : [],
  };

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
  const hasResults = matchUp.tieMatchUps.find(({ score }) => score);

  if (matchUp.tieFormat && !hasWinner && !hasResults) {
    // if matchUp.tieFormat is equivalent to hierarchical tieFormat, remove
    const inheritedTieFormat =
      structure?.tieFormat ||
      drawDefinition?.tieFormat ||
      event?.tieFormat ||
      undefined;

    if (
      inheritedTieFormat &&
      JSON.stringify(tieFormat) === JSON.stringify(inheritedTieFormat)
    ) {
      matchUp.tieFormat = undefined;
    }
  }

  modifyMatchUpScore({
    matchUpStatus: newMatchUpStatus,
    score: scoreObject,
    removeWinningSide,
    tournamentRecord,
    drawDefinition,
    removeScore,
    winningSide,
    matchUpId,
    matchUp,
    event,
  });

  return { ...SUCCESS, removeWinningSide, score: scoreObject };
}
