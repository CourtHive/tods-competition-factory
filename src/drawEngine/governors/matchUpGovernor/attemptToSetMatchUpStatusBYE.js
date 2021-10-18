import { structureAssignedDrawPositions } from '../../getters/positionsGetter';
import { modifyMatchUpNotice } from '../../notifications/drawNotifications';

import { INVALID_MATCHUP_STATUS } from '../../../constants/errorConditionConstants';
import { BYE } from '../../../constants/matchUpStatusConstants';
import { SUCCESS } from '../../../constants/resultConstants';

export function attemptToSetMatchUpStatusBYE({
  drawDefinition,
  structure,
  matchUp,
}) {
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
    modifyMatchUpNotice({ drawDefinition, matchUp });
    return SUCCESS;
  } else {
    return {
      error: 'Cannot Assign BYE status if no assignment: { bye: true }',
    };
  }
}
