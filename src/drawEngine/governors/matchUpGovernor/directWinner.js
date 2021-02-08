import { structureAssignedDrawPositions } from '../../getters/positionsGetter';
import { assignDrawPosition } from '../positionGovernor/positionAssignment';
import { assignMatchUpDrawPosition } from './assignMatchUpDrawPosition';

export function directWinner({
  drawDefinition,
  winnerTargetLink,
  winningDrawPosition,
  winnerMatchUp,
  winnerMatchUpDrawPositionIndex,
}) {
  let error;

  if (winnerTargetLink) {
    const targetMatchUpDrawPositions = winnerMatchUp.drawPositions || [];
    const targetMatchUpDrawPosition =
      targetMatchUpDrawPositions[winnerMatchUpDrawPositionIndex];

    console.log('%c winner is targeted to another structure', 'color: pink', {
      targetMatchUpDrawPositions,
    });

    const sourceStructureId = winnerTargetLink.source.structureId;
    const {
      positionAssignments: sourcePositionAssignments,
    } = structureAssignedDrawPositions({
      drawDefinition,
      structureId: sourceStructureId,
    });
    const winnerParticipantId = sourcePositionAssignments.reduce(
      (participantId, assignment) => {
        return assignment.drawPosition === winningDrawPosition
          ? assignment.participantId
          : participantId;
      },
      undefined
    );

    const targetStructureId = winnerTargetLink.target.structureId;
    const {
      positionAssignments: targetPositionAssignments,
    } = structureAssignedDrawPositions({
      drawDefinition,
      structureId: targetStructureId,
    });

    const winnerExistingDrawPosition = targetPositionAssignments.reduce(
      (drawPosition, assignment) => {
        return assignment.participantId === winnerParticipantId
          ? assignment.drawPosition
          : drawPosition;
      },
      undefined
    );

    const unfilledTargetMatchUpDrawPositions = targetPositionAssignments
      .filter((assignment) => {
        const inTarget = targetMatchUpDrawPositions.includes(
          assignment.drawPosition
        );
        const unfilled =
          !assignment.participantId && !assignment.bye && !assignment.qualifier;
        return inTarget && unfilled;
      })
      .map((assignment) => assignment.drawPosition);
    const targetDrawPositionIsUnfilled = unfilledTargetMatchUpDrawPositions.includes(
      targetMatchUpDrawPosition
    );

    if (
      winnerTargetLink.target.roundNumber === 1 &&
      targetDrawPositionIsUnfilled
    ) {
      assignDrawPosition({
        drawDefinition,
        structureId: targetStructureId,
        participantId: winnerParticipantId,
        drawPosition: targetMatchUpDrawPosition,
      });
    } else if (unfilledTargetMatchUpDrawPositions.length) {
      const drawPosition = unfilledTargetMatchUpDrawPositions.pop();
      assignDrawPosition({
        drawDefinition,
        structureId: targetStructureId,
        participantId: winnerParticipantId,
        drawPosition,
      });
    } else if (winnerExistingDrawPosition) {
      ({ error } = assignMatchUpDrawPosition({
        drawDefinition,
        matchUpId: winnerMatchUp.matchUpId,
        drawPosition: winnerExistingDrawPosition,
      }));
    } else {
      error = 'winner target position unavaiallble';
      console.log(error);
    }
  } else {
    ({ error } = assignMatchUpDrawPosition({
      drawDefinition,
      matchUpId: winnerMatchUp.matchUpId,
      drawPosition: winningDrawPosition,
    }));
  }

  return { error };
}
