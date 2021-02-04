import { getAllStructureMatchUps } from '../../getters/getMatchUps/getAllStructureMatchUps';
import { removeSubsequentRoundsParticipant } from './removeSubsequentRoundsParticipant';
import { structureAssignedDrawPositions } from '../../getters/positionsGetter';
import { findStructure } from '../../getters/findStructure';
import { modifyMatchUpScore } from './modifyMatchUpScore';
import { updateTieMatchUpScore } from './tieMatchUpScore';
import { instanceCount } from '../../../utilities';

import { SUCCESS } from '../../../constants/resultConstants';
import { TO_BE_PLAYED } from '../../../constants/matchUpStatusConstants';

export function removeDirectedParticipants(props) {
  const {
    drawDefinition,
    structure,
    matchUp,
    matchUpStatus,
    matchUpStatusCodes,
    mappedMatchUps,
    targetData,
  } = props;

  const isCollectionMatchUp = Boolean(matchUp.collectionId);
  if (isCollectionMatchUp) {
    modifyMatchUpScore({
      matchUpStatus: matchUpStatus || TO_BE_PLAYED,
      drawDefinition: props.drawDefinition,
      matchUpStatusCodes,
      removeScore: true,
      matchUp,
    });

    const { matchUpTieId } = props;
    updateTieMatchUpScore({ drawDefinition, matchUpId: matchUpTieId });

    return SUCCESS;
  }

  const {
    targetLinks: { loserTargetLink, winnerTargetLink },
    targetMatchUps: { loserMatchUp, winnerMatchUp },
  } = targetData;

  const { positionAssignments } = structureAssignedDrawPositions({ structure });

  if (matchUp.drawPositions) {
    const winningSide = matchUp.winningSide;
    const winningIndex = winningSide - 1;
    const losingIndex = 1 - winningIndex;
    const winningDrawPosition = matchUp.drawPositions[winningIndex];
    const loserDrawPosition = matchUp.drawPositions[losingIndex];
    const loserParticipantId = positionAssignments.reduce(
      (participantId, assignment) => {
        return assignment.drawPosition === loserDrawPosition
          ? assignment.participantId
          : participantId;
      },
      undefined
    );
    const winnerParticipantId = positionAssignments.reduce(
      (participantId, assignment) => {
        return assignment.drawPosition === winningDrawPosition
          ? assignment.participantId
          : participantId;
      },
      undefined
    );

    modifyMatchUpScore({
      matchUpStatus: matchUpStatus || TO_BE_PLAYED,
      drawDefinition: props.drawDefinition,
      matchUpStatusCodes,
      removeScore: true,
      matchUp,
    });

    if (winnerMatchUp) {
      const { error } = removeDirectedWinner({
        winnerMatchUp,
        mappedMatchUps,
        drawDefinition,
        winnerTargetLink,
        winnerParticipantId,
        winningDrawPosition,
      });
      if (error) return { errors: [error] };
    }
    if (loserMatchUp) {
      const { error } = removeDirectedLoser({
        loserMatchUp,
        mappedMatchUps,
        drawDefinition,
        loserTargetLink,
        loserParticipantId,
      });
      if (error) return { errors: [error] };
    }
  } else {
    return { errors: [{ error: 'matchUp missing drawPositions' }] };
  }

  return SUCCESS;
}

function removeDirectedWinner({
  winnerMatchUp,
  mappedMatchUps,
  drawDefinition,
  winnerTargetLink,
  winnerParticipantId,
  winningDrawPosition,
}) {
  let error;

  const { structureId, roundNumber } = winnerMatchUp;

  if (winnerTargetLink) {
    const structureId = winnerTargetLink.target.structureId;
    const { structure } = findStructure({ drawDefinition, structureId });
    const { positionAssignments } = structureAssignedDrawPositions({
      structure,
    });
    const winnerDrawPosition = positionAssignments.reduce(
      (winnerDrawPosition, assignment) => {
        return assignment.participantId === winnerParticipantId
          ? assignment.drawPosition
          : winnerDrawPosition;
      },
      undefined
    );

    const { matchUps } = getAllStructureMatchUps({ drawDefinition, structure });
    const allDrawPositionInstances = matchUps
      .map((matchUp) => matchUp.drawPositions)
      .flat(Infinity)
      .filter((f) => f);
    const drawPositionInstanceCount = instanceCount(allDrawPositionInstances);
    const winnerDrawPositionInstances =
      drawPositionInstanceCount[winnerDrawPosition];

    if (winnerDrawPositionInstances === 1) {
      // only remove position assignment if it has a single instance...
      // if there are multiple instances then a participant has been fed back into a draw
      positionAssignments.forEach((assignment) => {
        if (assignment.participantId === winnerParticipantId) {
          delete assignment.participantId;
        }
      });
    } else {
      console.log('not removing from position assignments since instances > 1');
    }
  }

  // Remove participant's drawPosition from current and subsequent round matchUps
  removeSubsequentRoundsParticipant({
    drawDefinition,
    mappedMatchUps,
    structureId,
    roundNumber,
    targetDrawPosition: winningDrawPosition,
  });

  return { error };
}

function removeDirectedLoser({
  drawDefinition,
  loserTargetLink,
  loserParticipantId,
}) {
  let error;

  const structureId = loserTargetLink.target.structureId;
  const { structure } = findStructure({ drawDefinition, structureId });
  const { positionAssignments } = structureAssignedDrawPositions({ structure });
  positionAssignments.forEach((assignment) => {
    if (assignment.participantId === loserParticipantId) {
      delete assignment.participantId;
    }
  });

  return { error };
}
