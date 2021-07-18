import { structureAssignedDrawPositions } from '../../getters/positionsGetter';
import { assignDrawPosition } from '../positionGovernor/positionAssignment';
import { assignMatchUpDrawPosition } from './assignMatchUpDrawPosition';

export function directWinner({
  drawDefinition,
  winnerTargetLink,
  winningDrawPosition,
  winnerMatchUp,
  winnerMatchUpDrawPositionIndex,

  matchUpsMap,
  inContextDrawMatchUps,
}) {
  let error;

  if (winnerTargetLink) {
    const targetMatchUpDrawPositions = winnerMatchUp.drawPositions || [];
    const targetMatchUpDrawPosition =
      targetMatchUpDrawPositions[winnerMatchUpDrawPositionIndex];

    const sourceStructureId = winnerTargetLink.source.structureId;
    const { positionAssignments: sourcePositionAssignments } =
      structureAssignedDrawPositions({
        drawDefinition,
        structureId: sourceStructureId,
      });

    const relevantSourceAssignment = sourcePositionAssignments.find(
      (assignment) => assignment.drawPosition === winningDrawPosition
    );
    const winnerParticipantId = relevantSourceAssignment?.participantId;

    const targetStructureId = winnerTargetLink.target.structureId;
    const { positionAssignments: targetPositionAssignments } =
      structureAssignedDrawPositions({
        drawDefinition,
        structureId: targetStructureId,
      });

    const relevantAssignment = targetPositionAssignments.find(
      (assignment) => assignment.participantId === winnerParticipantId
    );
    const winnerExistingDrawPosition = relevantAssignment?.drawPosition;

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
    const targetDrawPositionIsUnfilled =
      unfilledTargetMatchUpDrawPositions.includes(targetMatchUpDrawPosition);

    if (
      winnerTargetLink.target.roundNumber === 1 &&
      targetDrawPositionIsUnfilled
    ) {
      assignDrawPosition({
        drawDefinition,
        structureId: targetStructureId,
        participantId: winnerParticipantId,
        drawPosition: targetMatchUpDrawPosition,
        matchUpsMap,
        inContextDrawMatchUps,
      });
    } else if (unfilledTargetMatchUpDrawPositions.length) {
      const drawPosition = unfilledTargetMatchUpDrawPositions.pop();
      assignDrawPosition({
        drawDefinition,
        structureId: targetStructureId,
        participantId: winnerParticipantId,
        drawPosition,
        matchUpsMap,
        inContextDrawMatchUps,
      });
    } else if (winnerExistingDrawPosition) {
      ({ error } = assignMatchUpDrawPosition({
        drawDefinition,
        matchUpId: winnerMatchUp.matchUpId,
        drawPosition: winnerExistingDrawPosition,

        matchUpsMap,
        inContextDrawMatchUps,
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

      matchUpsMap,
      inContextDrawMatchUps,
    }));
  }

  return { error };
}
