import { structureAssignedDrawPositions } from '../../getters/positionsGetter';
import { addNotice } from '../../../global/globalState';

import { MODIFY_MATCHUP } from '../../../constants/topicConstants';
import { BYE } from '../../../constants/matchUpStatusConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import {
  INVALID_MATCHUP_STATUS,
  MISSING_MATCHUP,
  MISSING_STRUCTURE,
} from '../../../constants/errorConditionConstants';

export function attemptToSetMatchUpStatusBYE({ matchUp, structure }) {
  if (!structure) return { error: MISSING_STRUCTURE };
  if (!matchUp) return { error: MISSING_MATCHUP };
  if (matchUp?.winningSide) {
    return { error: INVALID_MATCHUP_STATUS, matchUpStatus: BYE };
  }
  // It is not possible to change matchUp status to BYE unless
  // matchUp.drawPositions includes BYE assigned position
  const { positionAssignments } = structureAssignedDrawPositions({
    structure,
  });

  const byeAssignedDrawPositions = positionAssignments
    .filter((assignment) => assignment.bye)
    .map((assignment) => assignment.drawPosition);

  const matchUpIncludesBye = matchUp.drawPositions?.some((position) =>
    byeAssignedDrawPositions.includes(position)
  );

  if (matchUpIncludesBye) {
    matchUp.matchUpStatus = BYE;
    matchUp.matchUpStatusCodes = [];
    addNotice({
      topic: MODIFY_MATCHUP,
      payload: { matchUp },
      key: matchUp.matchUpId,
    });
    return SUCCESS;
  } else {
    return {
      error: 'Cannot Assign BYE status if no assignment: { bye: true }',
    };
  }
}
