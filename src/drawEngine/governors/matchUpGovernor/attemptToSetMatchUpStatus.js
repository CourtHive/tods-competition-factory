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
import { SUCCESS } from '../../../constants/resultConstants';

export function attemptToSetMatchUpStatus(params) {
  const {
    notes,
    matchUp,
    matchUpId,
    structure,
    targetData,
    matchUpStatus,
    matchUpFormat,
    drawDefinition,
    matchUpStatusCodes,
    tournamentRecord,
    event,

    matchUpsMap,
  } = params;

  if (matchUp.winningSide) {
    if (matchUpStatus === BYE) {
      return { error: INVALID_MATCHUP_STATUS, matchUpStatus };
    } else if (isDirectingMatchUpStatus({ matchUpStatus })) {
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
      modifyMatchUpScore({
        notes,
        matchUp,
        matchUpId,
        matchUpStatus,
        matchUpFormat,
        drawDefinition,
        matchUpStatusCodes,
        tournamentRecord,
        event,
      });
    } else if (isNonDirectingMatchUpStatus({ matchUpStatus })) {
      // only possible to remove winningSide if neither winner
      // nor loser has been directed further into target structures
      const result = removeDirectedParticipants(params);
      if (result.error) return result;
      modifyMatchUpScore({
        notes,
        matchUp,
        matchUpId,
        matchUpFormat,
        drawDefinition,
        matchUpStatus: matchUpStatus || TO_BE_PLAYED,
        matchUpStatusCodes,
        tournamentRecord,
        event,
      });
    } else {
      return { error: UNRECOGNIZED_MATCHUP_STATUS };
    }
  } else if (isNonDirectingMatchUpStatus({ matchUpStatus })) {
    const removeScore = [CANCELLED, WALKOVER].includes(matchUpStatus);
    modifyMatchUpScore({
      notes,
      matchUp,
      matchUpId,
      removeScore,
      matchUpFormat,
      drawDefinition,
      matchUpStatusCodes,
      matchUpStatus: matchUpStatus || TO_BE_PLAYED,
      tournamentRecord,
      event,
    });
  } else if (matchUpStatus === BYE) {
    const result = attemptToSetMatchUpStatusBYE({ matchUp, structure });
    if (result.error) return result;
  } else {
    if (isDirectingMatchUpStatus({ matchUpStatus })) {
      if (matchUpStatus === DOUBLE_WALKOVER) {
        modifyMatchUpScore({
          notes,
          matchUp,
          matchUpId,
          matchUpStatus,
          matchUpFormat,
          drawDefinition,
          removeScore: true,
          matchUpStatusCodes,
          tournamentRecord,
          event,
        });

        doubleWalkoverAdvancement(params);
      } else {
        return { error: INVALID_MATCHUP_STATUS, matchUpStatus };
      }
    } else {
      return { error: UNRECOGNIZED_MATCHUP_STATUS };
    }
  }

  return SUCCESS;
}
