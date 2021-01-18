import { structureAssignedDrawPositions } from '../../getters/positionsGetter';
import { removeDirectedParticipants } from './removeDirectedParticipants';

import { TO_BE_PLAYED } from '../../../constants/matchUpStatusConstants';
import {
  MISSING_MATCHUP,
  MISSING_STRUCTURE,
} from '../../../constants/errorConditionConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import { positionTargets } from '../positionGovernor/positionTargets';

export function attemptToSetMatchUpStatusToBePlayed(props) {
  const { drawDefinition, structure, matchUp } = props;
  if (!structure) return { error: MISSING_STRUCTURE };
  if (!matchUp) return { error: MISSING_MATCHUP };
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
    const targetData = positionTargets({
      matchUpId: matchUp.matchUpId,
      structure,
      drawDefinition,
      mappedMatchUps,
      inContextDrawMatchUps,
      sourceMatchUpWinnerDrawPositionIndex,
    });
    const { errors: participantDirectionErrors } = removeDirectedParticipants({
      drawDefinition,
      structure,
      matchUp,
      matchUpStatus: TO_BE_PLAYED,
      matchUpStatusCodes: [],
      targetData,
    });

    if (participantDirectionErrors) {
      return { error: participantDirectionErrors };
    }
    matchUp.matchUpStatus = TO_BE_PLAYED;
    matchUp.matchUpStatusCodes = [];
    return SUCCESS;
  } else {
    return {
      error: 'Cannot Assign BYE status if no assignment: { bye: true }',
    };
  }
}
