import { removeDirectedParticipants } from './removeDirectedParticipantsAndUpdateOutcome';
import { doubleWalkoverAdvancement } from '../positionGovernor/doubleWalkoverAdvancement';
import { attemptToSetMatchUpStatusBYE } from './attemptToSetMatchUpStatusBYE';
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

  const isBYE = matchUpStatus === BYE;
  const existingWinningSide = matchUp.winningSide;
  const setWOWO = [DOUBLE_WALKOVER, DOUBLE_DEFAULT].includes(matchUpStatus);

  const directing = isDirectingMatchUpStatus({ matchUpStatus });
  const nonDirecting = isNonDirectingMatchUpStatus({ matchUpStatus });
  const unrecognized = !directing && !nonDirecting;

  // if matchUpTieId present a TEAM matchUp is being modified...
  // at present TEAM matchUps cannot be scored directly
  const onlyModifyScore =
    params.matchUpTieId || (existingWinningSide && directing && !setWOWO);

  const changeCompletedToWOWO = existingWinningSide && setWOWO;

  const clearScore = () =>
    modifyMatchUpScore({
      ...params,
      removeScore: [CANCELLED, WALKOVER].includes(matchUpStatus),
      matchUpStatus: matchUpStatus || TO_BE_PLAYED,
    });

  return (
    (unrecognized && { error: UNRECOGNIZED_MATCHUP_STATUS }) ||
    (onlyModifyScore && scoreModification(params)) ||
    (changeCompletedToWOWO && removeWinningSideSetWOWO(params)) ||
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
    (setWOWO && modifyScoreAndAdvanceWOWO(params)) || {
      error: INVALID_MATCHUP_STATUS,
    }
  );
}

function removeWinningSideSetWOWO(params) {
  let result = removeDirectedParticipants(params);
  if (result.error) return result;
  return doubleWalkoverAdvancement(params);
}

function modifyScoreAndAdvanceWOWO(params) {
  const result = scoreModification({ ...params, removeScore: true });
  if (result.error) return result;
  return doubleWalkoverAdvancement(params);
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
    const result = updateTieMatchUpScore({
      tournamentRecord: params.tournamentRecord,
      matchUpId: matchUpTieId,
      drawDefinition,
    });
    if (result.error) return decorateResult({ result, stack });
  }

  return decorateResult({ result, stack });
}
