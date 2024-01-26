import { structureAssignedDrawPositions } from '@Query/drawDefinition/positionsGetter';
import { modifyMatchUpScore } from '@Mutate/matchUps/score/modifyMatchUpScore';
import { isDirectingMatchUpStatus } from '@Query/matchUp/checkStatusType';
import { decorateResult } from '@Functions/global/decorateResult';
import { isAdHoc } from '@Query/drawDefinition/isAdHoc';

// constants
import { ABANDONED, CANCELLED, COMPLETED, WALKOVER } from '../../../constants/matchUpStatusConstants';
import { MISSING_ASSIGNMENTS } from '../../../constants/errorConditionConstants';

export function attemptToModifyScore(params) {
  const { dualWinningSideChange, matchUpStatusCodes, drawDefinition, matchUpStatus, structure, matchUp } = params;

  const matchUpStatusIsValid =
    isDirectingMatchUpStatus({ matchUpStatus }) ||
    // in the case that CANCELLED or ABANDONED causes TEAM participant to advance
    ([CANCELLED, ABANDONED].includes(matchUpStatus) && dualWinningSideChange);

  const stack = 'attemptToModifyScore';
  const isCollectionMatchUp = Boolean(matchUp.collectionId);
  const isAdHocMatchUp = isAdHoc({ drawDefinition, structure });
  const validToScore =
    isCollectionMatchUp || isAdHocMatchUp || drawPositionsAssignedParticipantIds({ structure, matchUp });

  if (!validToScore) {
    return { error: MISSING_ASSIGNMENTS };
  }

  const removeScore = [WALKOVER].includes(matchUpStatus);

  const result = modifyMatchUpScore({
    ...params,
    matchUpStatusCodes: (matchUpStatusIsValid && matchUpStatusCodes) || [],
    matchUpStatus: (matchUpStatusIsValid && matchUpStatus) || COMPLETED,
    context: stack,
    removeScore,
  });
  return decorateResult({ result, stack });
}

function drawPositionsAssignedParticipantIds({ structure, matchUp }) {
  const { drawPositions } = matchUp;
  const { positionAssignments } = structureAssignedDrawPositions({ structure });
  const assignedParticipantIds = positionAssignments?.filter((assignment) => {
    return drawPositions?.includes(assignment.drawPosition) && assignment.participantId;
  });
  return assignedParticipantIds?.length === 2;
}
