import { doubleWalkoverAdvancement } from '../positionGovernor/doubleWalkoverAdvancement';
import { checkDoubleWalkoverPropagation } from './checkDoubleWalkoverPropagation';
import { attemptToSetMatchUpStatusBYE } from './attemptToSetMatchUpStatusBYE';
import { removeDirectedParticipants } from './removeDirectedParticipants';
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
  const WOWO = matchUpStatus === DOUBLE_WALKOVER;
  const existingWinningSide = matchUp.winningSide;
  const directing = isDirectingMatchUpStatus({ matchUpStatus });
  const nonDirecting = isNonDirectingMatchUpStatus({ matchUpStatus });

  const clearScore = () =>
    modifyMatchUpScore({
      ...params,
      removeScore: [CANCELLED, WALKOVER].includes(matchUpStatus),
      matchUpStatus: params.matchUpStatus || TO_BE_PLAYED,
    });

  return (
    (!directing && !nonDirecting && { error: UNRECOGNIZED_MATCHUP_STATUS }) ||
    (existingWinningSide && removeWinningSide(params, directing, WOWO)) ||
    (nonDirecting && clearScore()) ||
    (isBYE && attemptToSetMatchUpStatusBYE({ matchUp, structure })) ||
    (!directing && { error: UNRECOGNIZED_MATCHUP_STATUS }) ||
    (WOWO && modifyScoreAndAdvanceWOWO(params)) ||
    (console.log('invalid', { matchUpStatus }) && {
      error: INVALID_MATCHUP_STATUS,
    })
  );
}

function removeWinningSide(params, directing, WOWO) {
  return (
    (directing && WOWO && removeDoubleWalkover(params)) ||
    (directing && modifyMatchUpScore(params)) ||
    removeAndModifyScore(params)
  );
}

function removeDoubleWalkover(params) {
  const { drawDefinition, matchUpsMap, targetData } = params;
  let result = removeDirectedParticipants(params);
  if (result.error) return result;

  result = checkDoubleWalkoverPropagation({
    drawDefinition,
    matchUpsMap,
    targetData,
  });
  if (result.error) return result;

  return modifyMatchUpScore(params);
}

function removeAndModifyScore(params) {
  const result = removeDirectedParticipants(params);
  if (result.error) return result;

  return modifyMatchUpScore({
    ...params,
    matchUpStatus: params.matchUpStatus || TO_BE_PLAYED,
  });
}

function modifyScoreAndAdvanceWOWO(params) {
  const result = modifyMatchUpScore({ ...params, removeScore: true });
  if (result.error) return result;
  return doubleWalkoverAdvancement(params);
}
