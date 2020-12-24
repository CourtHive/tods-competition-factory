import { instanceCount } from '../../../utilities';
import { findMatchUp } from '../../getters/getMatchUps';
import { findStructure } from '../../getters/findStructure';
import { checkIfWinnerHadBye } from './checkIfWinnerHadBye';
import { getAllStructureMatchUps } from '../../getters/getMatchUps';
import { structureAssignedDrawPositions } from '../../getters/positionsGetter';
import { updateTieMatchUpScore } from '../../accessors/matchUpAccessor/tieMatchUpScore';

import { FIRST_MATCHUP } from '../../../constants/drawDefinitionConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import { clearDrawPosition } from '../positionGovernor/positionClear';

export function removeDirectedParticipants(props) {
  const {
    drawDefinition,
    structure,
    matchUp,
    matchUpStatus,
    matchUpStatusCodes,
    targetData,
  } = props;
  const errors = [];

  const isCollectionMatchUp = Boolean(matchUp.collectionId);
  if (isCollectionMatchUp) {
    delete matchUp.score;
    delete matchUp.winningSide;

    matchUp.matchUpStatus = matchUpStatus;
    const { matchUpTieId } = props;
    updateTieMatchUpScore({ drawDefinition, matchUpId: matchUpTieId });

    return SUCCESS;
  }

  const {
    targetLinks: { loserTargetLink, winnerTargetLink },
    targetMatchUps: {
      loserMatchUp,
      winnerMatchUp,
      loserMatchUpDrawPositionIndex,
    },
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

    delete matchUp.score;
    delete matchUp.winningSide;

    matchUp.matchUpStatus = matchUpStatus;
    matchUp.matchUpStatusCodes = matchUpStatusCodes;

    const { matchUps: sourceMatchUps } = getAllStructureMatchUps({
      inContext: true,
      drawDefinition,
      structure,
    });

    const drawPositionMatchUps = sourceMatchUps.filter((matchUp) =>
      matchUp.drawPositions.includes(loserDrawPosition)
    );

    if (winnerMatchUp) {
      const { error } = removeDirectedWinner({
        winnerMatchUp,
        drawDefinition,
        winnerTargetLink,
        winnerParticipantId,
        winningDrawPosition,
      });
      if (error) errors.push(error);
    }
    if (loserMatchUp) {
      const winnerHadBye = checkIfWinnerHadBye({
        sourceMatchUps,
        loserDrawPosition,
        drawPositionMatchUps,
      });

      const targetMatchUpDrawPositions = loserMatchUp.drawPositions || [];
      const targetMatchUpDrawPosition =
        targetMatchUpDrawPositions[loserMatchUpDrawPositionIndex];
      const loserLinkCondition = loserTargetLink.linkCondition;
      const firstMatchUpLoss = loserLinkCondition === FIRST_MATCHUP;

      if (winnerHadBye && firstMatchUpLoss) {
        const { error } = removeDirectedBye({
          winningIndex,
          loserMatchUp,
          drawDefinition,
          targetLink: loserTargetLink,
          targetMatchUpDrawPosition,
        });
        if (error) errors.push(error);
      }

      const { error } = removeDirectedLoser({
        loserMatchUp,
        drawDefinition,
        loserTargetLink,
        loserParticipantId,
      });
      if (error) errors.push(error);
    }
  } else {
    errors.push({ error: 'matchUp missing drawPositions ' });
  }

  return errors.length ? { errors } : SUCCESS;
}

function removeDirectedWinner({
  winnerMatchUp,
  drawDefinition,
  winnerTargetLink,
  winnerParticipantId,
  winningDrawPosition,
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
      // console.log('not removing from position assignments since instances > 1')
    }
    const { matchUp } = findMatchUp({
      drawDefinition,
      matchUpId: winnerMatchUp.matchUpId,
    });
    matchUp.drawPositions = (matchUp.drawPositions || []).map(
      (drawPosition) => {
        return drawPosition === winnerDrawPosition ? undefined : drawPosition;
      }
    );
  } else {
    const { matchUp } = findMatchUp({
      drawDefinition,
      matchUpId: winnerMatchUp.matchUpId,
    });
    matchUp.drawPositions = (matchUp.drawPositions || []).map(
      (drawPosition) => {
        return drawPosition === winningDrawPosition ? undefined : drawPosition;
      }
    );
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
  positionAssignments.forEach((assignment) => {
    if (assignment.participantId === loserParticipantId) {
      delete assignment.participantId;
    }
  });

  return { error };
}

function removeDirectedBye({
  targetLink,
  loserMatchUp,
  winningIndex,
  drawDefinition,
}) {
  let error;

  const drawPosition = loserMatchUp.drawPositions[winningIndex];
  const structureId = targetLink.target.structureId;

  clearDrawPosition({
    drawDefinition,
    structureId,
    drawPosition,
  });

  return { error };
}
