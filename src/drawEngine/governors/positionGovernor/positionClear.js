import {
  getAllDrawMatchUps,
  getAllStructureMatchUps,
} from '../../getters/getMatchUps';
import { numericSort } from '../../../utilities';
import { findStructure } from '../../getters/findStructure';
import { setMatchUpStatus } from '../matchUpGovernor/setMatchUpStatus';
import { structureAssignedDrawPositions } from '../../getters/positionsGetter';
import { positionTargets } from '../../governors/positionGovernor/positionTargets';
import { structureActiveDrawPositions } from '../../getters/structureActiveDrawPositions';
import { removeMatchUpDrawPosition } from '../../governors/matchUpGovernor/matchUpDrawPosition';

import {
  DRAW_POSITION_ACTIVE,
  MISSING_DRAW_POSITION,
  DRAW_POSITION_NOT_CLEARED,
  MISSING_DRAW_POSITIONS,
} from '../../../constants/errorConditionConstants';
import { BYE, TO_BE_PLAYED } from '../../../constants/matchUpStatusConstants';
import { SUCCESS } from '../../../constants/resultConstants';

/**
 *
 * @param {object} drawDefinition - automatically added if drawEngine state has been set
 * @param {number} drawPosition - number of drawPosition for which actions are to be returned
 * @param {string} structureId - id of structure of drawPosition
 * @param {string} participantId - id of participant to be removed
 *
 */
export function clearDrawPosition({
  drawDefinition,
  drawPosition,
  participantId,
  structureId,
}) {
  const { structure } = findStructure({ drawDefinition, structureId });
  const { positionAssignments } = structureAssignedDrawPositions({
    drawDefinition,
    structure,
  });

  const byeAssignedDrawPositions = positionAssignments
    .filter((assignment) => assignment.bye)
    .map((assignment) => assignment.drawPosition)
    .filter((f) => f);

  const existingAssignment = positionAssignments.reduce(
    (value, assignment) =>
      (participantId && assignment.participantId === participantId) ||
      (drawPosition && assignment.drawPosition === drawPosition)
        ? assignment
        : value,
    undefined
  );

  if (participantId && !drawPosition) {
    drawPosition = existingAssignment?.drawPosition;
  }
  if (!drawPosition) return { error: MISSING_DRAW_POSITION };
  if (!participantId) participantId = existingAssignment?.participantId;

  const { activeDrawPositions } = structureActiveDrawPositions({
    drawDefinition,
    structureId,
  });
  const drawPositionIsActive = activeDrawPositions.includes(drawPosition);

  // drawPosition may not be cleared if:
  // 1. drawPosition has been advanced by winning a matchUp
  // 2. drawPosition is paired with another drawPosition which has been advanced by winning a matchUp
  if (drawPositionIsActive) return { error: DRAW_POSITION_ACTIVE };

  let drawPositionCleared;
  positionAssignments.forEach((assignment) => {
    if (assignment.drawPosition === drawPosition) {
      assignment.participantId = undefined;
      delete assignment.qualifier;
      delete assignment.bye;
      drawPositionCleared = true;
    }
  });

  const matchUpFilters = { isCollectionMatchUp: false };
  const { matchUps } = getAllStructureMatchUps({
    drawDefinition,
    matchUpFilters,
    structure,
  });
  const { matchUps: inContextDrawMatchUps } = getAllDrawMatchUps({
    drawDefinition,
    inContext: true,
    includeByeMatchUps: true,
  });

  matchUps.forEach((matchUp) => {
    if (matchUp.drawPositions?.includes(drawPosition)) {
      const isByeMatchUp = matchUp.drawPositions?.reduce(
        (isByeMatchUp, drawPosition) => {
          return (
            byeAssignedDrawPositions.includes(drawPosition) || isByeMatchUp
          );
        },
        false
      );

      if (isByeMatchUp || matchUp.matchUpStatus === BYE) {
        removeByeAndCleanUp({ matchUp, drawPosition, inContextDrawMatchUps });
      }
    }
  });

  if (!drawPositionCleared) return { error: DRAW_POSITION_NOT_CLEARED };

  return Object.assign({}, SUCCESS, { participantId });

  function removeByeAndCleanUp({
    matchUp,
    drawPosition,
    inContextDrawMatchUps,
  }) {
    const { matchUpId } = matchUp;
    setMatchUpStatus({
      drawDefinition,
      matchUpId,
      matchUpStatus: TO_BE_PLAYED,
      matchUpStatusCodes: [],
    });

    // if there is a linked draw then BYE must also be placed there
    // This must be propagated through compass draw, for instance
    const pairedDrawPosition = matchUp.drawPositions?.reduce(
      (pairedDrawPosition, currentDrawPosition) => {
        return currentDrawPosition !== drawPosition
          ? currentDrawPosition
          : pairedDrawPosition;
      },
      undefined
    );

    const sourceMatchUpWinnerDrawPositionIndex = matchUp.drawPositions?.indexOf(
      drawPosition
    );

    const {
      targetLinks: { loserTargetLink, winnerTargetLink },
      targetMatchUps: { loserMatchUp, winnerMatchUp },
    } = positionTargets({
      matchUpId,
      structure,
      drawDefinition,
      inContextDrawMatchUps,
      sourceMatchUpWinnerDrawPositionIndex,
    });

    // clear Directed Byes
    if (loserMatchUp && loserMatchUp.matchUpStatus === BYE) {
      // loserMatchUp must have both drawPositions defined
      const loserMatchUpDrawPositionsCount = loserMatchUp.drawPositions?.filter(
        (f) => f
      ).length;
      if (loserMatchUpDrawPositionsCount !== 2)
        return { error: MISSING_DRAW_POSITIONS };
      // drawPositions must be in numerical order
      loserMatchUp.drawPositions = (loserMatchUp.drawPositions || []).sort(
        numericSort
      );
      // loser drawPosition in target structure is determined bye even/odd
      const targetDrawPositionIndex = 1 - (matchUp.roundPosition % 2);

      const structureId = loserTargetLink.target.structureId;
      const targetDrawPosition =
        loserMatchUp.drawPositions[targetDrawPositionIndex];
      clearDrawPosition({
        drawDefinition,
        structureId,
        drawPosition: targetDrawPosition,
      });
    }

    if (winnerMatchUp) {
      if (
        winnerTargetLink &&
        matchUp.structureId !== winnerTargetLink.target.structureId
      ) {
        // TODO: if the winnerMatchUp structureId is different than the matchUp structureId
        // => the winner participantId should be removed from the positionAssignments of target structure
        console.log(
          '%c ALERT: remove winner participantId from target structure positionAssignments',
          'color: red'
        );
      }

      removeMatchUpDrawPosition({
        drawDefinition,
        matchUpId: winnerMatchUp.matchUpId,
        drawPosition: pairedDrawPosition,
      });
    }
  }
}
