import { structureAssignedDrawPositions } from '../../getters/positionsGetter';
import { decorateResult } from '../../../global/functions/decorateResult';
import { isDirectingMatchUpStatus } from './checkStatusType';
import { modifyMatchUpScore } from './modifyMatchUpScore';
import { isAdHoc } from '../queryGovernor/isAdHoc';

import { MISSING_ASSIGNMENTS } from '../../../constants/errorConditionConstants';
import {
  ABANDONED,
  CANCELLED,
  COMPLETED,
  WALKOVER,
} from '../../../constants/matchUpStatusConstants';

export function attemptToModifyScore(params) {
  const {
    dualWinningSideChange,
    matchUpStatusCodes,
    tournamentRecord,
    drawDefinition,
    matchUpFormat,
    matchUpStatus,
    winningSide,
    matchUpId,
    structure,
    matchUp,
    event,
    score,
  } = params;

  const matchUpStatusIsValid =
    isDirectingMatchUpStatus({ matchUpStatus }) ||
    // in the case that CANCELLED or ABANDONED causes TEAM participant to advance
    ([CANCELLED, ABANDONED].includes(matchUpStatus) && dualWinningSideChange);

  const stack = 'attemptToModifyScore';
  const isCollectionMatchUp = Boolean(matchUp.collectionId);
  const isAdHocMatchUp = isAdHoc({ drawDefinition, structure });
  const validToScore =
    isCollectionMatchUp ||
    isAdHocMatchUp ||
    drawPositionsAssignedParticipantIds({ structure, matchUp });

  if (!validToScore) {
    return { error: MISSING_ASSIGNMENTS };
  }

  const removeScore = [WALKOVER].includes(matchUpStatus);

  const result = modifyMatchUpScore({
    matchUpStatusCodes: (matchUpStatusIsValid && matchUpStatusCodes) || [],
    matchUpStatus: (matchUpStatusIsValid && matchUpStatus) || COMPLETED,
    tournamentRecord,
    drawDefinition,
    matchUpFormat,
    removeScore,
    winningSide,
    matchUpId,
    matchUp,
    event,
    score,
  });
  return decorateResult({ result, stack });
}

function drawPositionsAssignedParticipantIds({ structure, matchUp }) {
  const { drawPositions } = matchUp;
  const { positionAssignments } = structureAssignedDrawPositions({ structure });
  const assignedParticipantIds = positionAssignments?.filter((assignment) => {
    return (
      drawPositions?.includes(assignment.drawPosition) &&
      assignment.participantId
    );
  });
  return assignedParticipantIds?.length === 2;
}
