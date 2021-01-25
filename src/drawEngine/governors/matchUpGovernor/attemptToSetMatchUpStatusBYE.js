import { structureAssignedDrawPositions } from '../../getters/positionsGetter';
import { BYE } from '../../../constants/matchUpStatusConstants';
import {
  INVALID_MATCHUP_STATUS,
  MISSING_MATCHUP,
  MISSING_STRUCTURE,
} from '../../../constants/errorConditionConstants';
import { SUCCESS } from '../../../constants/resultConstants';

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
  const matchUpIncludesBye = matchUp.drawPositions?.reduce(
    (includesBye, position) => {
      return byeAssignedDrawPositions.includes(position) ? true : includesBye;
    },
    undefined
  );

  if (matchUpIncludesBye) {
    console.log('setting BYE');
    matchUp.matchUpStatus = BYE;
    matchUp.matchUpStatusCodes = [];
    return SUCCESS;
  } else {
    return {
      error: 'Cannot Assign BYE status if no assignment: { bye: true }',
    };
  }
}
