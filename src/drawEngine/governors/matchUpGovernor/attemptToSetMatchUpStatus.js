import { doubleExitAdvancement } from '../positionGovernor/doubleExitAdvancement';
import { attemptToSetMatchUpStatusBYE } from './attemptToSetMatchUpStatusBYE';
import { removeDirectedParticipants } from './removeDirectedParticipants';
import { decorateResult } from '../../../global/functions/decorateResult';
import { updateTieMatchUpScore } from './tieMatchUpScore';
import { modifyMatchUpScore } from './modifyMatchUpScore';
import {
  isDirectingMatchUpStatus,
  isNonDirectingMatchUpStatus,
} from './checkStatusType';

import {
  INVALID_MATCHUP_STATUS,
  UNRECOGNIZED_MATCHUP_STATUS,
} from '../../../constants/errorConditionConstants';
import {
  BYE,
  CANCELLED,
  DOUBLE_DEFAULT,
  DOUBLE_WALKOVER,
  TO_BE_PLAYED,
  WALKOVER,
} from '../../../constants/matchUpStatusConstants';

export function attemptToSetMatchUpStatus(params) {
  const {
    tournamentRecord,
    drawDefinition,
    matchUpStatus,
    structure,
    matchUp,
  } = params;

  const stack = 'attemptToSetMatchUpStatus';

  const isBYE = matchUpStatus === BYE;
  const existingWinningSide = matchUp.winningSide;
  const isDoubleExit = [DOUBLE_WALKOVER, DOUBLE_DEFAULT].includes(
    matchUpStatus
  );

  const directing = isDirectingMatchUpStatus({ matchUpStatus });
  const nonDirecting = isNonDirectingMatchUpStatus({ matchUpStatus });
  const unrecognized = !directing && !nonDirecting;

  // if matchUpTieId present a TEAM matchUp is being modified...
  const onlyModifyScore =
    params.matchUpTieId || (existingWinningSide && directing && !isDoubleExit);

  const changeCompletedToDoubleExit = existingWinningSide && isDoubleExit;

  const clearScore = () =>
    modifyMatchUpScore({
      ...params,
      removeScore: [CANCELLED, WALKOVER].includes(matchUpStatus),
      matchUpStatus: matchUpStatus || TO_BE_PLAYED,
    });

  return (
    (unrecognized && { error: UNRECOGNIZED_MATCHUP_STATUS }) ||
    (onlyModifyScore && scoreModification(params)) ||
    (changeCompletedToDoubleExit &&
      removeWinningSideAndSetDoubleExit(params)) ||
    (existingWinningSide && removeDirectedParticipants(params)) ||
    (nonDirecting && clearScore()) ||
    (isBYE &&
      attemptToSetMatchUpStatusBYE({
        tournamentRecord,
        drawDefinition,
        structure,
        matchUp,
      })) ||
    (!directing && { error: UNRECOGNIZED_MATCHUP_STATUS }) ||
    (isDoubleExit && modifyScoreAndAdvanceDoubleExit(params)) ||
    decorateResult({
      result: { error: INVALID_MATCHUP_STATUS },
      stack,
    })
  );
}

function removeWinningSideAndSetDoubleExit(params) {
  let result = removeDirectedParticipants(params);
  if (result.error) return result;
  return doubleExitAdvancement(params);
}

function modifyScoreAndAdvanceDoubleExit(params) {
  const result = scoreModification({ ...params, removeScore: true });
  if (result.error) return result;
  return doubleExitAdvancement(params);
}

function scoreModification(params) {
  const stack = 'scoreModification';

  const removeDirected =
    params.isCollectionMatchUp &&
    params.dualMatchUp?.winningSide &&
    !params.projectedWinningSide;

  if (removeDirected) {
    const result = removeDirectedParticipants(params);
    if (result.error) return decorateResult({ result, stack });
  }
  const isCollectionMatchUp = Boolean(params.matchUp.collectionId);
  const result = modifyMatchUpScore(params);

  // recalculate dualMatchUp score if isCollectionMatchUp
  if (isCollectionMatchUp) {
    const { matchUpTieId, drawDefinition } = params;
    const tieMatchUpResult = updateTieMatchUpScore({
      tournamentRecord: params.tournamentRecord,
      matchUpId: matchUpTieId,
      event: params.event,
      drawDefinition,
    });
    if (tieMatchUpResult.error) {
      return decorateResult({ result: tieMatchUpResult, stack });
    }
    Object.assign(result, { tieMatchUpResult });
  }

  return decorateResult({ result, stack });
}
