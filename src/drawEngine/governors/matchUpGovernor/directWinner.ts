import { removeLineUpSubstitutions } from '../../../tournamentEngine/governors/eventGovernor/drawDefinitions/removeLineUpSubstitutions';
import { structureAssignedDrawPositions } from '../../getters/positionsGetter';
import { assignDrawPosition } from '../positionGovernor/positionAssignment';
import { modifyMatchUpNotice } from '../../notifications/drawNotifications';
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
  event,
}) {
  const stack = 'directWinner';

  if (winnerTargetLink) {
    const targetMatchUpDrawPositions = winnerMatchUp.drawPositions || [];
    const targetMatchUpDrawPosition =
      targetMatchUpDrawPositions[winnerMatchUpDrawPositionIndex];

    const sourceStructureId = winnerTargetLink.source.structureId;
    const result = findStructure({
      structureId: sourceStructureId,
      drawDefinition,
    });
    if (result.error) return result;
    const { structure } = result;

    const { positionAssignments: sourcePositionAssignments } =
      structureAssignedDrawPositions({
        structureId: sourceStructureId,
        drawDefinition,
      });

    const relevantSourceAssignment = sourcePositionAssignments?.find(
      (assignment) => assignment.drawPosition === winningDrawPosition
    );
    const winnerParticipantId = relevantSourceAssignment?.participantId;

    const targetStructureId = winnerTargetLink.target.structureId;
    const { positionAssignments: targetPositionAssignments } =
      structureAssignedDrawPositions({
        structureId: targetStructureId,
        drawDefinition,
      });

    const relevantAssignment = targetPositionAssignments?.find(
      (assignment) => assignment.participantId === winnerParticipantId
    );
    const winnerExistingDrawPosition = relevantAssignment?.drawPosition;

    const unfilledTargetMatchUpDrawPositions = targetPositionAssignments
      ?.filter((assignment) => {
        const inTarget = targetMatchUpDrawPositions.includes(
          assignment.drawPosition
        );
        const unfilled =
          !assignment.participantId && !assignment.bye && !assignment.qualifier;
        return inTarget && unfilled;
      })
      .map((assignment) => assignment.drawPosition);
    const targetDrawPositionIsUnfilled =
      unfilledTargetMatchUpDrawPositions?.includes(targetMatchUpDrawPosition);

    if (
      winnerParticipantId &&
      winnerTargetLink.target.roundNumber === 1 &&
      targetDrawPositionIsUnfilled
    ) {
      assignDrawPosition({
        drawPosition: targetMatchUpDrawPosition,
        participantId: winnerParticipantId,
        structureId: targetStructureId,
        inContextDrawMatchUps,
        sourceMatchUpStatus,
        tournamentRecord,
        drawDefinition,
        matchUpsMap,
        event,
      });
    } else if (
      winnerParticipantId &&
      unfilledTargetMatchUpDrawPositions?.length
    ) {
      const drawPosition = unfilledTargetMatchUpDrawPositions.pop();
      drawPosition &&
        assignDrawPosition({
          participantId: winnerParticipantId,
          structureId: targetStructureId,
          inContextDrawMatchUps,
          sourceMatchUpStatus,
          tournamentRecord,
          drawDefinition,
          drawPosition,
          matchUpsMap,
          event,
        });
    } else if (winnerExistingDrawPosition) {
      const result = assignMatchUpDrawPosition({
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
        const filteredLineUp = side.lineUp?.filter(
          (assignment) => assignment?.participantId
        );

        targetSide.lineUp = removeLineUpSubstitutions({
          lineUp: filteredLineUp,
        });

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
