import { structureAssignedDrawPositions } from '../../getters/positionsGetter';
import { isDirectingMatchUpStatus } from './checkStatusType';
import { updateTieMatchUpScore } from './tieMatchUpScore';
import { modifyMatchUpScore } from './modifyMatchUpScore';
import { directWinner } from './directWinner';
import { directLoser } from './directLoser';

import { COMPLETED, WALKOVER } from '../../../constants/matchUpStatusConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import {
  MISSING_ASSIGNMENTS,
  MISSING_DRAW_POSITIONS,
} from '../../../constants/errorConditionConstants';

export function directParticipants(params) {
  const {
    dualWinningSideChange,
    projectedWinningSide,
    inContextDrawMatchUps,
    matchUpStatusCodes,
    tournamentRecord,
    drawDefinition,
    matchUpFormat,
    matchUpStatus,
    dualMatchUp,
    matchUpsMap,
    winningSide,
    targetData,
    matchUpId,
    structure,
    matchUp,
    event,
    score,
  } = params;

  const isCollectionMatchUp = Boolean(matchUp.collectionId);
  const validToScore =
    isCollectionMatchUp ||
    drawPositionsAssignedParticipantIds({ structure, matchUp });

  if (!validToScore) {
    return { error: MISSING_ASSIGNMENTS };
  }

  const matchUpStatusIsValid = isDirectingMatchUpStatus({ matchUpStatus });

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
  if (result.error) return result;

  let drawPositions = matchUp.drawPositions;

  if (isCollectionMatchUp) {
    const { matchUpTieId } = params;
    updateTieMatchUpScore({
      drawDefinition,
      matchUpId: matchUpTieId,
    });
    const matchUpTie = inContextDrawMatchUps.find(
      ({ matchUpId }) => matchUpId === matchUpTieId
    );
    drawPositions = matchUpTie?.drawPositions;
    if (!dualWinningSideChange) return { ...SUCCESS };
  }

  if (drawPositions) {
    const winningIndex = winningSide - 1;
    const losingIndex = 1 - winningIndex;

    const winningDrawPosition = drawPositions[winningIndex];
    const loserDrawPosition = drawPositions[losingIndex];

    const {
      targetLinks: { loserTargetLink, winnerTargetLink },
      targetMatchUps: {
        winnerMatchUpDrawPositionIndex,
        loserMatchUpDrawPositionIndex,
        winnerMatchUp,
        loserMatchUp,
      },
    } = targetData;

    if (winnerMatchUp) {
      const result = directWinner({
        winnerMatchUpDrawPositionIndex,
        inContextDrawMatchUps,
        projectedWinningSide,
        winningDrawPosition,
        winnerTargetLink,
        drawDefinition,
        winnerMatchUp,
        dualMatchUp,
        matchUpsMap,
      });
      if (result.error) return result;
    }
    if (loserMatchUp) {
      const result = directLoser({
        loserMatchUpDrawPositionIndex,
        inContextDrawMatchUps,
        projectedWinningSide,
        loserDrawPosition,
        loserTargetLink,
        drawDefinition,
        matchUpStatus,
        loserMatchUp,
        winningSide,
        matchUpsMap,
      });
      if (result.error) return result;
    }
  } else {
    return { error: MISSING_DRAW_POSITIONS };
  }

  return SUCCESS;
}

function drawPositionsAssignedParticipantIds({ structure, matchUp }) {
  const { drawPositions } = matchUp;
  const { positionAssignments } = structureAssignedDrawPositions({ structure });
  const assignedParticipantIds = positionAssignments.filter((assignment) => {
    return (
      drawPositions.includes(assignment.drawPosition) &&
      assignment.participantId
    );
  });
  return assignedParticipantIds.length === 2;
}
