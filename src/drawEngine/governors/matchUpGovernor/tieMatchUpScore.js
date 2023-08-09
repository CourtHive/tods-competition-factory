import { removeExtension } from '../../../tournamentEngine/governors/tournamentGovernor/addRemoveExtensions';
import { generateTieMatchUpScore } from '../../generators/tieMatchUpScore/generateTieMatchUpScore';
import { copyTieFormat } from '../../../matchUpEngine/governors/tieFormatGovernor/copyTieFormat';
import { getTieFormat } from '../../../matchUpEngine/governors/tieFormatGovernor/getTieFormat';
import { findExtension } from '../../../global/functions/deducers/findExtension';
import { findMatchUp } from '../../getters/getMatchUps/findMatchUp';
import { isActiveMatchUp } from '../../getters/activeMatchUp';
import { modifyMatchUpScore } from './modifyMatchUpScore';

import { INVALID_MATCHUP } from '../../../constants/errorConditionConstants';
import { DISABLE_AUTO_CALC } from '../../../constants/extensionConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import {
  COMPLETED,
  completedMatchUpStatuses,
  IN_PROGRESS,
  TO_BE_PLAYED,
} from '../../../constants/matchUpStatusConstants';

export function updateTieMatchUpScore({
  tournamentRecord,
  exitWhenNoValues,
  drawDefinition,
  matchUpStatus,
  removeScore,
  matchUpsMap,
  matchUpId,
  event,
}) {
  const result = findMatchUp({ drawDefinition, event, matchUpId });
  if (result.error) return result;

  const { matchUp, structure } = result;

  if (!matchUp.tieMatchUps) return { error: INVALID_MATCHUP };

  const { extension } = findExtension({
    name: DISABLE_AUTO_CALC,
    element: matchUp,
  });

  if (extension?.value) {
    if (!removeScore) {
      return { ...SUCCESS, score: matchUp.score };
    } else {
      removeExtension({ element: matchUp, name: DISABLE_AUTO_CALC });
    }
  }

  const tieFormat = getTieFormat({
    drawDefinition,
    structure,
    matchUp,
    event,
  })?.tieFormat;

  matchUp.tieFormat = copyTieFormat(tieFormat);

  const { winningSide, set, scoreStringSide1, scoreStringSide2 } =
    generateTieMatchUpScore({
      drawDefinition,
      matchUpsMap,
      structure,
      matchUp,
      event,
    });

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
  const newMatchUpStatus =
    (hasWinner && COMPLETED) ||
    (isActiveMatchUp({
      matchUpStatus: matchUpStatus || matchUp.matchUpStatus,
      tieMatchUps: matchUp.tieMatchUps,
      winningSide: matchUp.winningSide,
      score: scoreObject,
    }) &&
      IN_PROGRESS) ||
    TO_BE_PLAYED;

  const removeWinningSide = matchUp.winningSide && !hasWinner;
  const hasResults = matchUp.tieMatchUps.find(
    ({ score, winningSide, matchUpStatus }) =>
      (score?.sets?.length &&
        (score.sets[0].side1Score || score.sets[0].side2Score)) ||
      completedMatchUpStatuses.includes(matchUpStatus) ||
      winningSide
  );

  let tieFormatRemoved;

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
      tieFormatRemoved = true;
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

  return {
    ...SUCCESS,
    score: scoreObject,
    removeWinningSide,
    tieFormatRemoved,
    winningSide,
  };
}
