import { doubleWalkoverAdvancement } from '../positionGovernor/doubleWalkoverAdvancement';
import { checkDoubleWalkoverPropagation } from './checkDoubleWalkoverPropagation';
import { attemptToSetMatchUpStatusBYE } from './attemptToSetMatchUpStatusBYE';
import { removeDirectedParticipants } from './removeDirectedParticipants';
import { modifyMatchUpScore } from './modifyMatchUpScore';
import {
  isDirectingMatchUpStatus,
  isNonDirectingMatchUpStatus,
} from './checkStatusType';

import { SUCCESS } from '../../../constants/resultConstants';
import {
  BYE,
  CANCELLED,
  DOUBLE_WALKOVER,
  TO_BE_PLAYED,
  WALKOVER,
} from '../../../constants/matchUpStatusConstants';
import {
  INVALID_MATCHUP_STATUS,
  UNRECOGNIZED_MATCHUP_STATUS,
} from '../../../constants/errorConditionConstants';

export function attemptToSetMatchUpStatus(params) {
  const { matchUp, structure, matchUpStatus } = params;

  const existingWinningSide = matchUp.winningSide;
  if (existingWinningSide) {
    return removeWinningSide(params);
  } else if (isNonDirectingMatchUpStatus({ matchUpStatus })) {
    return modifyMatchUpScore({
      ...params,
      removeScore: [CANCELLED, WALKOVER].includes(matchUpStatus),
      matchUpStatus: params.matchUpStatus || TO_BE_PLAYED,
    });
  } else if (matchUpStatus === BYE) {
    return attemptToSetMatchUpStatusBYE({ matchUp, structure });
  } else if (!isDirectingMatchUpStatus({ matchUpStatus })) {
    return { error: UNRECOGNIZED_MATCHUP_STATUS };
  } else if (matchUpStatus === DOUBLE_WALKOVER) {
    return modifyScoreAndAdvanceWOWO(params);
  } else {
    return { error: INVALID_MATCHUP_STATUS, matchUpStatus };
  }
}

function modifyScoreAndAdvanceWOWO(params) {
  const result = modifyMatchUpScore({ ...params, removeScore: true });
  if (result.error) return result;
  return doubleWalkoverAdvancement(params);
}

function removeWinningSide(params) {
  const { matchUpStatus, drawDefinition, matchUpsMap, targetData } = params;
  if (isDirectingMatchUpStatus({ matchUpStatus })) {
    if (matchUpStatus === DOUBLE_WALKOVER) {
      let result = removeDirectedParticipants(params);
      if (result.error) return result;
      result = checkDoubleWalkoverPropagation({
        drawDefinition,
        matchUpsMap,
        targetData,
      });
      if (result.error) return result;
    }
    const result = modifyMatchUpScore(params);
    if (result.error) return result;
  } else if (isNonDirectingMatchUpStatus({ matchUpStatus })) {
    // only possible to remove winningSide if neither winner
    // nor loser has been directed further into target structures
    const result = removeDirectedParticipants(params);
    if (result.error) return result;

    const scoringResult = modifyMatchUpScore({
      ...params,
      matchUpStatus: params.matchUpStatus || TO_BE_PLAYED,
    });
    if (scoringResult.error) return scoringResult;
  } else {
    return { error: UNRECOGNIZED_MATCHUP_STATUS };
  }

  return { ...SUCCESS };
}
