import { findMatchUp } from '../../getters/getMatchUps';
import { findStructure } from '../../getters/structureGetter';
import { getAllStructureMatchUps } from '../../getters/getMatchUps';
import { structureAssignedDrawPositions } from '../../getters/positionsGetter';
import { updateTieMatchUpScore } from '../../accessors/matchUpAccessor/tieMatchUpScore';

import { instanceCount } from '../../../utilities';
import { SUCCESS } from '../../../constants/resultConstants';

export function removeDirectedParticipants(props) {
  const {
    drawDefinition,
    structure,
    matchUp,
    matchUpStatus,
    targetData,
  } = props;
  const errors = [];

  const isCollectionMatchUp = Boolean(matchUp.collectionId);
  if (isCollectionMatchUp) {
    delete matchUp.sets;
    delete matchUp.score;
    delete matchUp.winningSide;

    matchUp.matchUpStatus = matchUpStatus;
    const { matchUpTieId } = props;
    updateTieMatchUpScore({ drawDefinition, matchUpId: matchUpTieId });

    return SUCCESS;
  }

  const {
    targetLinks: { loserTargetLink, winnerTargetLink },
    targetMatchUps: { loserMatchUp, winnerMatchUp },
  } = targetData;

  const { positionAssignments } = structureAssignedDrawPositions({ structure });

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

  delete matchUp.sets;
  delete matchUp.score;
  delete matchUp.winningSide;

  matchUp.matchUpStatus = matchUpStatus;

  if (winnerMatchUp) {
    const { error } = removeDirectedWinner({
      drawDefinition,
      winnerTargetLink,
      winnerParticipantId,
      winningDrawPosition,
      winnerMatchUp,
    });
    if (error) errors.push(error);
  }
  if (loserMatchUp) {
    const { error } = removeDirectedLoser({
      drawDefinition,
      loserTargetLink,
      loserParticipantId,
    });
    if (error) errors.push(error);
  }

  return errors.length ? { errors } : SUCCESS;
}

function removeDirectedWinner({
  drawDefinition,
  winnerTargetLink,
  winnerParticipantId,
  winningDrawPosition,
  winnerMatchUp,
}) {
  let error;

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
      .map(matchUp => matchUp.drawPositions)
      .flat(Infinity)
      .filter(f => f);
    const drawPositionInstanceCount = instanceCount(allDrawPositionInstances);
    const winnerDrawPositionInstances =
      drawPositionInstanceCount[winnerDrawPosition];

    if (winnerDrawPositionInstances === 1) {
      // only remove position assignment if it has a single instance...
      // if there are multiple instances then a participant has been fed back into a draw
      positionAssignments.forEach(assignment => {
        if (assignment.participantId === winnerParticipantId) {
          delete assignment.participantId;
        }
      });
    } else {
      // console.log('not removing from position assignments since instances > 1')
    }
    const { matchUp } = findMatchUp({
      drawDefinition,
      matchUpId: winnerMatchUp.matchUpId,
    });
    matchUp.drawPositions = matchUp.drawPositions.map(drawPosition => {
      return drawPosition === winnerDrawPosition ? undefined : drawPosition;
    });
  } else {
    const { matchUp } = findMatchUp({
      drawDefinition,
      matchUpId: winnerMatchUp.matchUpId,
    });
    matchUp.drawPositions = matchUp.drawPositions.map(drawPosition => {
      return drawPosition === winningDrawPosition ? undefined : drawPosition;
    });
  }

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
  positionAssignments.forEach(assignment => {
    if (assignment.participantId === loserParticipantId) {
      delete assignment.participantId;
    }
  });

  return { error };
}
