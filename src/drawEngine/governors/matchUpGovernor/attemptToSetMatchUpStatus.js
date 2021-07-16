import { removeDirectedParticipants } from './removeDirectedParticipantsAndUpdateOutcome';
import { doubleWalkoverAdvancement } from '../positionGovernor/doubleWalkoverAdvancement';
import { checkDoubleWalkoverPropagation } from './checkDoubleWalkoverPropagation';
import { attemptToSetMatchUpStatusBYE } from './attemptToSetMatchUpStatusBYE';
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
  DOUBLE_WALKOVER,
  TO_BE_PLAYED,
  WALKOVER,
} from '../../../constants/matchUpStatusConstants';

export function attemptToSetMatchUpStatus(params) {
  const { matchUp, structure, matchUpStatus } = params;

  const isBYE = matchUpStatus === BYE;
  const existingWinningSide = matchUp.winningSide;
  const setWOWO = matchUpStatus === DOUBLE_WALKOVER;
  const clearWOWO =
    matchUp.matchUpStatus === DOUBLE_WALKOVER && matchUpStatus === TO_BE_PLAYED;

  const directing = isDirectingMatchUpStatus({ matchUpStatus });
  const nonDirecting = isNonDirectingMatchUpStatus({ matchUpStatus });
  const unrecognized = !directing && !nonDirecting;

  const onlyModifyScore = existingWinningSide && directing && !setWOWO;
  const changeCompletedToWOWO = existingWinningSide && setWOWO;

  const clearScore = () =>
    modifyMatchUpScore({
      ...params,
      removeScore: [CANCELLED, WALKOVER].includes(matchUpStatus),
      matchUpStatus: matchUpStatus || TO_BE_PLAYED,
    });

  return (
    (unrecognized && { error: UNRECOGNIZED_MATCHUP_STATUS }) ||
    (onlyModifyScore && modifyMatchUpScore(params)) ||
    (changeCompletedToWOWO && removeWinningSideSetWOWO(params)) ||
    (existingWinningSide && removeDirectedParticipants(params)) ||
    (nonDirecting && clearScore()) ||
    (clearWOWO && removeDoubleWalkover(params)) ||
    (isBYE && attemptToSetMatchUpStatusBYE({ matchUp, structure })) ||
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

function removeDoubleWalkover(params) {
  console.log('clear WOWO');
  const { drawDefinition, matchUpsMap, targetData } = params;
  let result = removeDirectedParticipants(params);
  if (result.error) return result;

  // removeDirectedParticipants should handle undoing WOWO propagation
  return checkDoubleWalkoverPropagation({
    drawDefinition,
    matchUpsMap,
    targetData,
  });
}

function modifyScoreAndAdvanceWOWO(params) {
  const result = modifyMatchUpScore({ ...params, removeScore: true });
  if (result.error) return result;
  return doubleWalkoverAdvancement(params);
}
