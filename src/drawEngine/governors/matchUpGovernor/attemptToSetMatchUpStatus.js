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

export function attemptToSetMatchUpStatus(props) {
  const {
    drawDefinition,
    notes,
    matchUp,
    structure,
    targetData,
    matchUpStatus,
    mappedMatchUps,
    matchUpStatusCodes,
  } = props;

  if (matchUp.winningSide) {
    if (matchUpStatus === BYE) {
      return { error: INVALID_MATCHUP_STATUS, matchUpStatus };
    } else if (isDirectingMatchUpStatus({ matchUpStatus })) {
      if (matchUpStatus === DOUBLE_WALKOVER) {
        const { errors: participantDirectionErrors } =
          removeDirectedParticipants(props);
        if (participantDirectionErrors) {
          return { error: participantDirectionErrors };
        }
        const result = checkDoubleWalkoverPropagation({
          drawDefinition,
          mappedMatchUps,
          targetData,
        });
        if (result.error) return result;
      }
      modifyMatchUpScore({
        notes,
        matchUp,
        drawDefinition,
        matchUpStatus,
        matchUpStatusCodes,
      });
    } else if (isNonDirectingMatchUpStatus({ matchUpStatus })) {
      // only possible to remove winningSide if neither winner
      // nor loser has been directed further into target structures
      const { errors: participantDirectionErrors } =
        removeDirectedParticipants(props);
      if (participantDirectionErrors) {
        return { error: participantDirectionErrors };
      }
      modifyMatchUpScore({
        notes,
        matchUp,
        drawDefinition,
        matchUpStatus: matchUpStatus || TO_BE_PLAYED,
        matchUpStatusCodes,
      });
    } else {
      return { error: UNRECOGNIZED_MATCHUP_STATUS };
    }
  } else if (isNonDirectingMatchUpStatus({ matchUpStatus })) {
    const removeScore = [CANCELLED, WALKOVER].includes(matchUpStatus);
    modifyMatchUpScore({
      notes,
      matchUp,
      drawDefinition,
      matchUpStatus: matchUpStatus || TO_BE_PLAYED,
      matchUpStatusCodes,
      removeScore,
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
          drawDefinition,
          matchUpStatus,
          matchUpStatusCodes,
          removeScore: true,
        });

        doubleWalkoverAdvancement(props);
      } else {
        return { error: INVALID_MATCHUP_STATUS, matchUpStatus };
      }
    } else {
      return { error: UNRECOGNIZED_MATCHUP_STATUS };
    }
  }

  return SUCCESS;
}
