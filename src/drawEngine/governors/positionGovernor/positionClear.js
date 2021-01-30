import { getAllStructureMatchUps } from '../../getters/getMatchUps/getAllStructureMatchUps';
import { structureActiveDrawPositions } from '../../getters/structureActiveDrawPositions';
import { removeMatchUpDrawPosition } from '../matchUpGovernor/assignMatchUpDrawPosition';
import { structureAssignedDrawPositions } from '../../getters/positionsGetter';
import { getAllDrawMatchUps } from '../../getters/getMatchUps/drawMatchUps';
import { drawPositionRemovals } from './drawPositionRemovals';
import { findStructure } from '../../getters/findStructure';
import { positionTargets } from './positionTargets';
import { numericSort } from '../../../utilities';

import { MISSING_DRAW_POSITIONS } from '../../../constants/errorConditionConstants';
import { BYE, TO_BE_PLAYED } from '../../../constants/matchUpStatusConstants';

import {
  DRAW_POSITION_ACTIVE,
  MISSING_DRAW_POSITION,
  DRAW_POSITION_NOT_CLEARED,
} from '../../../constants/errorConditionConstants';
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
  mappedMatchUps,
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

  const isByeRemoval = byeAssignedDrawPositions.includes(drawPosition);

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

  const { matchUps: inContextDrawMatchUps } = getAllDrawMatchUps({
    drawDefinition,
    mappedMatchUps,
    inContext: true,
    includeByeMatchUps: true,
  });

  // if (isByeRemoval) {
  drawPositionRemovals({
    inContextDrawMatchUps,
    drawDefinition,
    mappedMatchUps,
    structureId,
    drawPosition,
  });
  //}
  /*
  const matchUpFilters = { isCollectionMatchUp: false };
  const { matchUps } = getAllStructureMatchUps({
    drawDefinition,
    mappedMatchUps,
    matchUpFilters,
    structure,
  });

  matchUps.forEach((matchUp) => {
    // for all matchUps which include the drawPosition being cleared...
    if (matchUp.drawPositions.includes(drawPosition)) {
      const isByeMatchUp = matchUp.drawPositions?.reduce(
        (isByeMatchUp, drawPosition) => {
          return (
            byeAssignedDrawPositions.includes(drawPosition) || isByeMatchUp
          );
        },
        false
      );

      // ... if the matchUp contains a { bye: true } drawPosition
      if (isByeMatchUp) {
        removeByeAndCleanUp({
          drawDefinition,
          mappedMatchUps,
          matchUp,
          structure,
          drawPosition,
          inContextDrawMatchUps,
        });
      }
    }
  });
  // }
  */

  const drawPositionCleared = positionAssignments.reduce(
    (cleared, assignment) => {
      if (assignment.drawPosition === drawPosition) {
        assignment.participantId = undefined;
        delete assignment.qualifier;
        delete assignment.bye;
        return true;
      }
      return cleared;
    },
    false
  );

  if (!drawPositionCleared) return { error: DRAW_POSITION_NOT_CLEARED };

  return Object.assign({}, SUCCESS, { participantId });
}

function removeByeAndCleanUp({
  drawDefinition,
  mappedMatchUps,
  matchUp,
  structure,
  drawPosition,
  inContextDrawMatchUps,
}) {
  const { matchUpId } = matchUp;

  matchUp.matchUpStatus = TO_BE_PLAYED;
  matchUp.matchUpStatusCodes = [];

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
    mappedMatchUps,
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
      inContextDrawMatchUps,
      drawDefinition,
      mappedMatchUps,
      structureId,
      drawPosition: targetDrawPosition,
    });
  }

  if (winnerMatchUp?.drawPositions.includes(pairedDrawPosition)) {
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

    const result = removeMatchUpDrawPosition({
      drawDefinition,
      mappedMatchUps,
      inContextDrawMatchUps,
      matchUpId: winnerMatchUp.matchUpId,
      drawPosition: pairedDrawPosition,
    });
    if (result.error) return result;
  }

  return SUCCESS;
}
