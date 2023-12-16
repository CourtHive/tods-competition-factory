import { resolveTieFormat } from '../../../matchUpEngine/governors/tieFormatGovernor/getTieFormat/resolveTieFormat';
import { generateTieMatchUpScore } from '../../../assemblies/generators/tieMatchUpScore/generateTieMatchUpScore';
import { copyTieFormat } from '../../../matchUpEngine/governors/tieFormatGovernor/copyTieFormat';
import { isActiveMatchUp } from '../../../drawEngine/getters/activeMatchUp';
import { removeExtension } from '../../extensions/removeExtension';
import { ensureSideLineUps } from '../lineUps/ensureSideLineUps';
import { findDrawMatchUp } from '../../../acquire/findDrawMatchUp';
import { findExtension } from '../../../acquire/findExtension';
import { modifyMatchUpScore } from './modifyMatchUpScore';

import { DISABLE_AUTO_CALC } from '../../../constants/extensionConstants';
import { MatchUpsMap } from '../../../drawEngine/getters/getMatchUps/getMatchUpsMap';
import { SUCCESS } from '../../../constants/resultConstants';
import {
  ErrorType,
  INVALID_MATCHUP,
  MATCHUP_NOT_FOUND,
} from '../../../constants/errorConditionConstants';
import {
  COMPLETED,
  completedMatchUpStatuses,
  IN_PROGRESS,
  TO_BE_PLAYED,
} from '../../../constants/matchUpStatusConstants';
import {
  DrawDefinition,
  Event,
  Tournament,
} from '../../../types/tournamentTypes';

type UpdateTieMatchUpScoreArgs = {
  tournamentRecord?: Tournament;
  drawDefinition: DrawDefinition;
  exitWhenNoValues?: boolean;
  matchUpsMap?: MatchUpsMap;
  matchUpStatus?: string;
  removeScore?: boolean;
  matchUpId: string;
  event?: Event;
};
export function updateTieMatchUpScore({
  tournamentRecord,
  exitWhenNoValues,
  drawDefinition,
  matchUpStatus,
  removeScore,
  matchUpsMap,
  matchUpId,
  event,
}: UpdateTieMatchUpScoreArgs): {
  removeWinningSide?: boolean;
  tieFormatRemoved?: boolean;
  winningSide?: number;
  error?: ErrorType;
  success?: boolean;
  score?: any;
} {
  const result = findDrawMatchUp({ drawDefinition, event, matchUpId });
  if (result.error) return result;
  if (!result.matchUp) return { error: MATCHUP_NOT_FOUND };

  const { matchUp, structure } = result;

  if (!matchUp.tieMatchUps) return { error: INVALID_MATCHUP };

  ensureSideLineUps({
    tournamentId: tournamentRecord?.tournamentId,
    eventId: event?.eventId,
    dualMatchUp: matchUp,
    drawDefinition,
  });

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

  const tieFormat = resolveTieFormat({
    drawDefinition,
    structure,
    matchUp,
    event,
  })?.tieFormat;

  matchUp.tieFormat = copyTieFormat(tieFormat);

  const scoreResult = generateTieMatchUpScore({
    drawDefinition,
    matchUpsMap,
    structure,
    matchUp,
    event,
  });

  const { winningSide, set, scoreStringSide1, scoreStringSide2 } = scoreResult;

  const setHasValue = set?.side1Score || set?.side2Score;
  if (exitWhenNoValues && !matchUp.score && !setHasValue) {
    return { ...SUCCESS };
  }

  const scoreObject = {
    scoreStringSide1,
    scoreStringSide2,
    sets: set ? [set] : [],
  };

  const hasWinner = winningSide && [1, 2].includes(winningSide);
  const newMatchUpStatus =
    (hasWinner && COMPLETED) ||
    (isActiveMatchUp({
      matchUpStatus: matchUpStatus ?? matchUp.matchUpStatus,
      tieMatchUps: matchUp.tieMatchUps,
      winningSide: matchUp.winningSide,
      score: scoreObject,
    }) &&
      IN_PROGRESS) ||
    TO_BE_PLAYED;

  const removeWinningSide = !!(matchUp.winningSide && !hasWinner);
  const hasResults = matchUp.tieMatchUps.find(
    ({ score, winningSide, matchUpStatus }) =>
      (score?.sets?.length &&
        (score.sets[0].side1Score || score.sets[0].side2Score)) ||
      (matchUpStatus && completedMatchUpStatuses.includes(matchUpStatus)) ||
      winningSide
  );

  let tieFormatRemoved;

  if (matchUp.tieFormat && !hasWinner && !hasResults) {
    // if matchUp.tieFormat is equivalent to hierarchical tieFormat, remove
    const inheritedTieFormat = resolveTieFormat({
      drawDefinition,
      structure,
      event,
    })?.tieFormat;

    if (
      inheritedTieFormat &&
      JSON.stringify(tieFormat) === JSON.stringify(inheritedTieFormat)
    ) {
      matchUp.tieFormatId = undefined;
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
