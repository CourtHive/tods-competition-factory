import { isDirectingMatchUpStatus } from './checkStatusType';
import { directLoser } from 'competitionFactory/drawEngine/governors/matchUpGovernor/directLoser';
import { directWinner } from 'competitionFactory/drawEngine/governors/matchUpGovernor/directWinner';
import { structureAssignedDrawPositions } from 'competitionFactory/drawEngine/getters/positionsGetter';
import { updateTieMatchUpScore } from 'competitionFactory/drawEngine/accessors/matchUpAccessor/tieMatchUpScore';

import { COMPLETED } from 'competitionFactory/constants/matchUpStatusConstants';
import { SUCCESS } from 'competitionFactory/constants/resultConstants';

export function directParticipants(props) {
  const {drawDefinition, matchUpStatus, structure, matchUp, winningSide, targetData, score, sets} = props;
  let errors = [];

  const isCollectionMatchUp = Boolean(matchUp.collectionId);
  const validToScore = isCollectionMatchUp || drawPositionsAssignedParticipantIds({structure, matchUp});
  if (!validToScore) {
    errors.push({ error: 'drawPositions are not all assigned participantIds' });
    return { errors };
  }
 
  matchUp.winningSide = winningSide;
  const matchUpStatusIsValid = isDirectingMatchUpStatus({ matchUpStatus });
  matchUp.matchUpStatus = (matchUpStatusIsValid && matchUpStatus) || COMPLETED;

  if (score) matchUp.score = score;
  if (sets) matchUp.sets = sets;

  if (isCollectionMatchUp) {
    const { matchUpTieId } = props;
    updateTieMatchUpScore({drawDefinition, matchUpId: matchUpTieId });
    return SUCCESS;
  }
  
  const winningIndex = winningSide - 1;
  const losingIndex = 1 - winningIndex;
  const winningDrawPosition = matchUp.drawPositions[winningIndex];
  const loserDrawPosition = matchUp.drawPositions[losingIndex];
  const targetMatchUpSide = 1 - matchUp.roundPosition % 2;
  
  const {
    targetLinks: { loserTargetLink, winnerTargetLink },
    targetMatchUps: { loserMatchUp, winnerMatchUp }
  } = targetData;
  
  if (winnerMatchUp) {
    const { error } = directWinner({drawDefinition, targetMatchUpSide, winnerTargetLink, winningDrawPosition, winnerMatchUp});
    if (error) errors.push(error);
  }
  if (loserMatchUp) {
    const { error } = directLoser({drawDefinition, targetMatchUpSide, loserTargetLink, loserDrawPosition, loserMatchUp});
    if (error) errors.push(error);
  }
  
  return errors.length ? { errors } : SUCCESS;
}

function drawPositionsAssignedParticipantIds({structure, matchUp}) {
  const { drawPositions } = matchUp;
  const { positionAssignments } = structureAssignedDrawPositions({structure});
  const assignedParticipantIds = positionAssignments.filter(assignment => {
    return drawPositions.includes(assignment.drawPosition) && assignment.participantId;
  });
  return assignedParticipantIds.length === 2;
}
