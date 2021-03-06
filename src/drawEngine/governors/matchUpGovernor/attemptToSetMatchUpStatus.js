import { removeDirectedParticipants } from './removeDirectedParticipantsAndUpdateOutcome';
import { doubleWalkoverAdvancement } from '../positionGovernor/doubleWalkoverAdvancement';
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

function modifyScoreAndAdvanceWOWO(params) {
  const result = modifyMatchUpScore({ ...params, removeScore: true });
  if (result.error) return result;
  return doubleWalkoverAdvancement(params);
}
