import { structureAssignedDrawPositions } from '../../getters/positionsGetter';
import { modifyMatchUpNotice } from '../../notifications/drawNotifications';
import { assignDrawPosition } from '../positionGovernor/positionAssignment';
import { decorateResult } from '../../../global/functions/decorateResult';
import { assignMatchUpDrawPosition } from './assignMatchUpDrawPosition';
import { assignSeed } from '../entryGovernor/seedAssignment';
import { findStructure } from '../../getters/findStructure';

import { QUALIFYING } from '../../../constants/drawDefinitionConstants';
import { SUCCESS } from '../../../constants/resultConstants';

export function directWinner({
  winnerMatchUpDrawPositionIndex,
  inContextDrawMatchUps,
  projectedWinningSide,
  sourceMatchUpStatus,
  winningDrawPosition,
  tournamentRecord,
  winnerTargetLink,
  sourceMatchUpId,
  drawDefinition,
  winnerMatchUp,
  dualMatchUp,
  matchUpsMap,
}) {
  const stack = 'directWinner';

  if (winnerTargetLink) {
    const targetMatchUpDrawPositions = winnerMatchUp.drawPositions || [];
    const targetMatchUpDrawPosition =
      targetMatchUpDrawPositions[winnerMatchUpDrawPositionIndex];

    const sourceStructureId = winnerTargetLink.source.structureId;
    const { structure, error } = findStructure({
      structureId: sourceStructureId,
      drawDefinition,
    });
    if (error) return { error };

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
        drawPositionIndex: winnerMatchUpDrawPositionIndex,
        drawPosition: targetMatchUpDrawPosition,
        participantId: winnerParticipantId,
        structureId: targetStructureId,
        inContextDrawMatchUps,
        sourceMatchUpStatus,
        tournamentRecord,
        sourceMatchUpId,
        drawDefinition,
        matchUpsMap,
      });
    } else if (unfilledTargetMatchUpDrawPositions.length) {
      const drawPosition = unfilledTargetMatchUpDrawPositions.pop();
      assignDrawPosition({
        drawPositionIndex: winnerMatchUpDrawPositionIndex,
        participantId: winnerParticipantId,
        structureId: targetStructureId,
        inContextDrawMatchUps,
        sourceMatchUpStatus,
        tournamentRecord,
        sourceMatchUpId,
        drawDefinition,
        drawPosition,
        matchUpsMap,
      });
    } else if (winnerExistingDrawPosition) {
      const result = assignMatchUpDrawPosition({
        drawPositionIndex: winnerMatchUpDrawPositionIndex,
        drawPosition: winnerExistingDrawPosition,
        matchUpId: winnerMatchUp.matchUpId,
        inContextDrawMatchUps,
        sourceMatchUpStatus,
        tournamentRecord,
        sourceMatchUpId,
        drawDefinition,
        matchUpsMap,
      });
      if (result.error) return decorateResult({ result, stack });
    } else {
      // qualifiers do not get automatically directed
      if (structure.stage !== QUALIFYING) {
        const error = 'winner target position unavaiallble';
        console.log(error);
        return { error };
      }
    }

    // propagate seedAssignments
    if (
      structure?.seedAssignments &&
      structure.structureId !== targetStructureId
    ) {
      const seedAssignment = structure.seedAssignments.find(
        ({ participantId }) => participantId === winnerParticipantId
      );
      if (seedAssignment) {
        assignSeed({
          eventId: winnerMatchUp?.eventId,
          structureId: targetStructureId,
          ...seedAssignment,
          tournamentRecord,
          drawDefinition,
        });
      }
    }
  } else {
    const result = assignMatchUpDrawPosition({
      drawPositionIndex: winnerMatchUpDrawPositionIndex,
      matchUpId: winnerMatchUp.matchUpId,
      drawPosition: winningDrawPosition,
      inContextDrawMatchUps,
      sourceMatchUpStatus,
      tournamentRecord,
      sourceMatchUpId,
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
        targetSide.lineUp = side.lineUp?.filter(
          (assignment) => assignment?.participantId
        );

        modifyMatchUpNotice({
          tournamentId: tournamentRecord?.tournamentId,
          eventId: winnerMatchUp?.eventId,
          matchUp: targetMatchUp,
          context: stack,
          drawDefinition,
        });
      }
    }
  }

  return { ...SUCCESS };
}
