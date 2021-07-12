import { getAllStructureMatchUps } from '../../getters/getMatchUps/getAllStructureMatchUps';
import { removeSubsequentRoundsParticipant } from './removeSubsequentRoundsParticipant';
import { structureAssignedDrawPositions } from '../../getters/positionsGetter';
import { clearDrawPosition } from '../positionGovernor/positionClear';
import { includesMatchUpStatuses } from './includesMatchUpStatuses';
import { findStructure } from '../../getters/findStructure';
import { modifyMatchUpScore } from './modifyMatchUpScore';
import { instanceCount } from '../../../utilities';

import { FIRST_MATCHUP } from '../../../constants/drawDefinitionConstants';
import { TO_BE_PLAYED } from '../../../constants/matchUpStatusConstants';
import { SUCCESS } from '../../../constants/resultConstants';

export function removeDirectedParticipants(props) {
  const {
    tournamentRecord,
    drawDefinition,
    structure,
    matchUp,
    matchUpId,
    matchUpStatus,
    matchUpFormat,
    matchUpStatusCodes,
    targetData,
    removeScore = true,
    score,
    event,

    matchUpsMap,
  } = props;

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

    // use redue for single pass resolution of both
    const { winnerParticipantId, loserParticipantId } =
      positionAssignments.reduce(
        (assignments, assignment) => {
          if (assignment.drawPosition === loserDrawPosition)
            assignments.loserParticipantId = assignment.participantId;
          if (assignment.drawPosition === winningDrawPosition)
            assignments.winnerParticipantId = assignment.participantId;
          return assignments;
        },
        { winnerParticipantId: undefined, loserParticipantId: undefined }
      );

    modifyMatchUpScore({
      matchUpStatus: matchUpStatus || TO_BE_PLAYED,
      drawDefinition: props.drawDefinition,
      removeWinningSide: true,
      matchUpStatusCodes,
      tournamentRecord,
      matchUpFormat,
      removeScore,
      matchUpId,
      matchUp,
      score,
      event,
    });

    const { matchUps: sourceMatchUps } = getAllStructureMatchUps({
      inContext: true,
      drawDefinition,
      structure,
      matchUpsMap,
    });

    const drawPositionMatchUps = sourceMatchUps.filter((matchUp) =>
      matchUp.drawPositions.includes(loserDrawPosition)
    );

    if (winnerMatchUp) {
      const result = removeDirectedWinner({
        winnerMatchUp,
        drawDefinition,
        winnerTargetLink,
        winnerParticipantId,
        winningDrawPosition,

        matchUpsMap,
      });
      if (result.error) return result;
    }
    if (loserMatchUp) {
      const { winnerHadMatchUpStatus: winnerHadBye } = includesMatchUpStatuses({
        sourceMatchUps,
        loserDrawPosition,
        drawPositionMatchUps,
      });

      const loserLinkCondition = loserTargetLink.linkCondition;
      const firstMatchUpLoss = loserLinkCondition === FIRST_MATCHUP;

      if (winnerHadBye && firstMatchUpLoss) {
        // The fed drawPosition is always the lowest number
        const drawPosition = Math.min(...loserMatchUp.drawPositions);
        const removeByeResult = removeDirectedBye({
          drawDefinition,
          drawPosition,
          targetLink: loserTargetLink,
          matchUpsMap,
        });
        if (removeByeResult.error) return removeByeResult;
      }

      const removeLoserResult = removeDirectedLoser({
        loserMatchUp,
        drawDefinition,
        loserTargetLink,
        loserParticipantId,
        matchUpsMap,
      });
      if (removeLoserResult) return removeLoserResult;
    }
  } else {
    return { error: 'matchUp missing drawPositions' };
  }

  return SUCCESS;
}

export function removeDirectedWinner({
  winnerMatchUp,
  drawDefinition,
  winnerTargetLink,
  winnerParticipantId,
  winningDrawPosition,

  matchUpsMap,
}) {
  let error;

  const { structureId, roundNumber } = winnerMatchUp;

  if (winnerTargetLink) {
    const structureId = winnerTargetLink.target.structureId;
    const { structure } = findStructure({ drawDefinition, structureId });
    const { positionAssignments } = structureAssignedDrawPositions({
      structure,
    });

    const relevantAssignment = positionAssignments.find(
      (assignment) => assignment.participantId === winnerParticipantId
    );
    const winnerDrawPosition = relevantAssignment?.drawPosition;

    const { matchUps } = getAllStructureMatchUps({ drawDefinition, structure });
    const allDrawPositionInstances = matchUps
      .map((matchUp) => matchUp.drawPositions)
      .flat(Infinity)
      .filter(Boolean);
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
    structureId,
    roundNumber,
    targetDrawPosition: winningDrawPosition,
    matchUpsMap,
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

export function removeDirectedBye({
  targetLink,
  drawPosition,
  drawDefinition,
  inContextDrawMatchUps,
  matchUpsMap,
}) {
  let error;

  const structureId = targetLink.target.structureId;

  clearDrawPosition({
    drawDefinition,
    inContextDrawMatchUps,
    structureId,
    drawPosition,
    matchUpsMap,
  });

  return { error };
}
