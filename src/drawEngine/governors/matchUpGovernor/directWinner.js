import { structureAssignedDrawPositions } from '../../getters/positionsGetter';
import { modifyMatchUpNotice } from '../../notifications/drawNotifications';
import { assignDrawPosition } from '../positionGovernor/positionAssignment';
import { assignMatchUpDrawPosition } from './assignMatchUpDrawPosition';
import { findStructure } from '../../getters/findStructure';

import { QUALIFYING } from '../../../constants/drawDefinitionConstants';
import { SUCCESS } from '../../../constants/resultConstants';

export function directWinner({
  winnerMatchUpDrawPositionIndex,
  inContextDrawMatchUps,
  projectedWinningSide,
  winningDrawPosition,
  tournamentRecord,
  winnerTargetLink,
  drawDefinition,
  winnerMatchUp,
  dualMatchUp,
  matchUpsMap,
}) {
  if (winnerTargetLink) {
    const targetMatchUpDrawPositions = winnerMatchUp.drawPositions || [];
    const targetMatchUpDrawPosition =
      targetMatchUpDrawPositions[winnerMatchUpDrawPositionIndex];

    const sourceStructureId = winnerTargetLink.source.structureId;
    const { positionAssignments: sourcePositionAssignments } =
      structureAssignedDrawPositions({
        structureId: sourceStructureId,
        drawDefinition,
      });

    const relevantSourceAssignment = sourcePositionAssignments.find(
      (assignment) => assignment.drawPosition === winningDrawPosition
    );
    const winnerParticipantId = relevantSourceAssignment?.participantId;

    const targetStructureId = winnerTargetLink.target.structureId;
    const { positionAssignments: targetPositionAssignments } =
      structureAssignedDrawPositions({
        structureId: targetStructureId,
        drawDefinition,
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
        drawPosition: targetMatchUpDrawPosition,
        participantId: winnerParticipantId,
        structureId: targetStructureId,
        inContextDrawMatchUps,
        tournamentRecord,
        drawDefinition,
        matchUpsMap,
      });
    } else if (unfilledTargetMatchUpDrawPositions.length) {
      const drawPosition = unfilledTargetMatchUpDrawPositions.pop();
      assignDrawPosition({
        participantId: winnerParticipantId,
        structureId: targetStructureId,
        inContextDrawMatchUps,
        tournamentRecord,
        drawDefinition,
        drawPosition,
        matchUpsMap,
      });
    } else if (winnerExistingDrawPosition) {
      const result = assignMatchUpDrawPosition({
        drawPosition: winnerExistingDrawPosition,
        matchUpId: winnerMatchUp.matchUpId,
        inContextDrawMatchUps,
        tournamentRecord,
        drawDefinition,
        matchUpsMap,
      });
      if (result.error) return result;
    } else {
      const { structure, error } = findStructure({
        structureId: sourceStructureId,
        drawDefinition,
      });
      if (error) return { error };

      // qualifiers do not get automatically directed
      if (structure.stage !== QUALIFYING) {
        const error = 'winner target position unavaiallble';
        console.log(error);
        return { error };
      }
    }
  } else {
    const result = assignMatchUpDrawPosition({
      matchUpId: winnerMatchUp.matchUpId,
      drawPosition: winningDrawPosition,
      inContextDrawMatchUps,
      tournamentRecord,
      drawDefinition,
      matchUpsMap,
    });
    if (result.error) return result;
  }

  if (dualMatchUp && projectedWinningSide) {
    // propagate lineUp
    const side = dualMatchUp.sides?.find(
      (side) => side.sideNumber === projectedWinningSide
    );
    if (side?.lineUp) {
      const source = dualMatchUp.roundPosition;
      const target = winnerMatchUp.roundPosition;
      const targetSideNumber =
        (source === target && source !== 1) || Math.floor(source / 2) === target
          ? 2
          : 1; // this may need to take roundNumber into consideration for cross structure propagation of lineUps

      const targetMatchUp = matchUpsMap?.drawMatchUps?.find(
        ({ matchUpId }) => matchUpId === winnerMatchUp.matchUpId
      );

      const updatedSides = [1, 2].map((sideNumber) => {
        const existingSide =
          targetMatchUp.sides?.find((side) => side.sideNumber === sideNumber) ||
          {};
        return { ...existingSide, sideNumber };
      });

      targetMatchUp.sides = updatedSides;
      const targetSide = targetMatchUp.sides.find(
        (side) => side.sideNumber === targetSideNumber
      );

      // attach to appropriate side of winnerMatchUp
      if (targetSide) {
        targetSide.lineUp = side.lineUp;

        modifyMatchUpNotice({
          tournamentId: tournamentRecord?.tournamentId,
          matchUp: targetMatchUp,
          drawDefinition,
        });
      }
    }
  }

  return { ...SUCCESS };
}
