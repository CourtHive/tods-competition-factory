import { structureAssignedDrawPositions } from '../../getters/positionsGetter';
import { isDirectingMatchUpStatus } from './checkStatusType';
import { updateTieMatchUpScore } from './tieMatchUpScore';
import { modifyMatchUpScore } from './modifyMatchUpScore';
import { directWinner } from './directWinner';
import { directLoser } from './directLoser';

import { COMPLETED, WALKOVER } from '../../../constants/matchUpStatusConstants';
import { SUCCESS } from '../../../constants/resultConstants';

export function directParticipants(props) {
  const {
    tournamentRecord,
    event,
    drawDefinition,
    matchUpStatus,
    matchUpStatusCodes,
    structure,
    matchUp,
    matchUpId,
    matchUpFormat,
    winningSide,
    targetData,
    score,
  } = props;

  const isCollectionMatchUp = Boolean(matchUp.collectionId);
  const validToScore =
    isCollectionMatchUp ||
    drawPositionsAssignedParticipantIds({ structure, matchUp });
  if (!validToScore) {
    return { error: 'drawPositions are not all assigned participantIds' };
  }

  const matchUpStatusIsValid = isDirectingMatchUpStatus({ matchUpStatus });

  const removeScore = [WALKOVER].includes(matchUpStatus);
  modifyMatchUpScore({
    drawDefinition,
    matchUpFormat,
    matchUpStatus: (matchUpStatusIsValid && matchUpStatus) || COMPLETED,
    matchUpStatusCodes: (matchUpStatusIsValid && matchUpStatusCodes) || [],
    tournamentRecord,
    winningSide,
    removeScore,
    matchUpId,
    matchUp,
    score,
    event,
  });

  if (isCollectionMatchUp) {
    const { matchUpTieId } = props;
    updateTieMatchUpScore({ drawDefinition, matchUpId: matchUpTieId });
    return SUCCESS;
  }

  if (matchUp.drawPositions) {
    const winningIndex = winningSide - 1;
    const losingIndex = 1 - winningIndex;
    const winningDrawPosition = matchUp.drawPositions[winningIndex];
    const loserDrawPosition = matchUp.drawPositions[losingIndex];

    const {
      targetLinks: { loserTargetLink, winnerTargetLink },
      targetMatchUps: {
        loserMatchUp,
        winnerMatchUp,
        loserMatchUpDrawPositionIndex,
        winnerMatchUpDrawPositionIndex,
      },
    } = targetData;

    if (winnerMatchUp) {
      const result = directWinner({
        drawDefinition,
        winnerTargetLink,
        winningDrawPosition,
        winnerMatchUp,
        winnerMatchUpDrawPositionIndex,
      });
      if (result.error) return result;
    }
    if (loserMatchUp) {
      const result = directLoser({
        drawDefinition,
        loserTargetLink,
        loserDrawPosition,
        loserMatchUp,
        loserMatchUpDrawPositionIndex,
        matchUpStatus,
      });
      if (result.error) return result;
    }
  } else {
    return { error: 'machUp is missing drawPositions' };
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
