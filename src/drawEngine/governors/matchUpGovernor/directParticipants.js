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
  const errors = [];

  const isCollectionMatchUp = Boolean(matchUp.collectionId);
  const validToScore =
    isCollectionMatchUp ||
    drawPositionsAssignedParticipantIds({ structure, matchUp });
  if (!validToScore) {
    errors.push({ error: 'drawPositions are not all assigned participantIds' });
    return { errors };
  }

  const matchUpStatusIsValid = isDirectingMatchUpStatus({ matchUpStatus });

  const removeScore = [WALKOVER].includes(matchUpStatus);
  modifyMatchUpScore({
    drawDefinition,
    matchUpFormat,
    matchUpStatus: (matchUpStatusIsValid && matchUpStatus) || COMPLETED,
    matchUpStatusCodes: (matchUpStatusIsValid && matchUpStatusCodes) || [],
    winningSide,
    removeScore,
    matchUpId,
    matchUp,
    score,
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
      const { error } = directWinner({
        drawDefinition,
        winnerTargetLink,
        winningDrawPosition,
        winnerMatchUp,
        winnerMatchUpDrawPositionIndex,
      });
      if (error) errors.push(error);
    }
    if (loserMatchUp) {
      const { error } = directLoser({
        drawDefinition,
        loserTargetLink,
        loserDrawPosition,
        loserMatchUp,
        loserMatchUpDrawPositionIndex,
        matchUpStatus,
      });
      if (error) errors.push(error);
    }
  } else {
    errors.push({ error: 'machUp is missing drawPositions ' });
  }

  return errors.length ? { errors } : SUCCESS;
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
