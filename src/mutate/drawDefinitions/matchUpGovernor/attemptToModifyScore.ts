import { structureAssignedDrawPositions } from '@Query/drawDefinition/positionsGetter';
import { modifyMatchUpScore } from '@Mutate/matchUps/score/modifyMatchUpScore';
import { isDirectingMatchUpStatus } from '@Query/matchUp/checkStatusType';
import { decorateResult } from '@Functions/global/decorateResult';
import { isAdHoc } from '@Query/drawDefinition/isAdHoc';

// constants
import { ABANDONED, CANCELLED, COMPLETED, INCOMPLETE, WALKOVER } from '@Constants/matchUpStatusConstants';
import { MISSING_ASSIGNMENTS } from '@Constants/errorConditionConstants';
import { POLICY_TYPE_SCORING } from '@Constants/policyConstants';

export function attemptToModifyScore(params) {
  const { matchUpStatusCodes, matchUpStatus, structure, matchUp, dualMatchUp } = params;

  const matchUpStatusIsValid =
    isDirectingMatchUpStatus({ matchUpStatus }) ||
    // in the case that CANCELLED or ABANDONED causes TEAM participant to advance
    ([CANCELLED, ABANDONED].includes(matchUpStatus) && dualMatchUp);

  const stack = 'attemptToModifyScore';
  const isCollectionMatchUp = Boolean(matchUp.collectionId);
  const isAdHocMatchUp = isAdHoc({ structure });
  const validToScore =
    isCollectionMatchUp ||
    isAdHocMatchUp ||
    drawPositionsAssignedParticipantIds({ structure, matchUp }) ||
    params.appliedPolicies?.[POLICY_TYPE_SCORING]?.requireParticipantsForScoring === false;

  if (!validToScore) return { error: MISSING_ASSIGNMENTS };

  const removeScore = [WALKOVER].includes(matchUpStatus);

  const updatedMatchUpStatus = matchUpStatusIsValid ? matchUpStatus : (params.winningSide && COMPLETED) || INCOMPLETE;
  const result = modifyMatchUpScore({
    ...params,
    matchUpStatusCodes: (matchUpStatusIsValid && matchUpStatusCodes) || [],
    matchUpStatus: updatedMatchUpStatus,
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
