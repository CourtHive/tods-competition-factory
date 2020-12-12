import { numericSort } from '../../../utilities';
import { findStructure } from '../../getters/findStructure';
import { getAllStructureMatchUps } from '../../getters/getMatchUps';
import { positionTargets } from '../../governors/positionGovernor/positionTargets';
import { removeMatchUpDrawPosition } from '../../governors/matchUpGovernor/matchUpDrawPosition';

import { structureAssignedDrawPositions } from '../../getters/positionsGetter';
import { structureActiveDrawPositions } from '../../getters/structureActiveDrawPositions';

import { SUCCESS } from '../../../constants/resultConstants';
import { BYE, TO_BE_PLAYED } from '../../../constants/matchUpStatusConstants';
import { setMatchUpStatus } from '../matchUpGovernor/matchUpStatus';
import {
  DRAW_POSITION_ACTIVE,
  MISSING_DRAW_POSITION,
  DRAW_POSITION_NOT_CLEARED,
  MISSING_DRAW_POSITIONS,
} from '../../../constants/errorConditionConstants';

export function clearDrawPosition({
  drawDefinition,
  structureId,
  participantId,
  drawPosition,
}) {
  const { structure } = findStructure({ drawDefinition, structureId });
  const { positionAssignments } = structureAssignedDrawPositions({
    drawDefinition,
    structure,
  });

  const byeAssignedDrawPositions = positionAssignments
    .filter(assignment => assignment.bye)
    .map(assignment => assignment.drawPosition)
    .filter(f => f);

  if (participantId && !drawPosition) {
    drawPosition = positionAssignments.reduce((drawPosition, assignment) => {
      return assignment.participantId === participantId
        ? assignment.drawPosition
        : drawPosition;
    }, undefined);
  }

  const { activeDrawPositions } = structureActiveDrawPositions({
    drawDefinition,
    structureId,
  });
  const drawPositionIsActive = activeDrawPositions.includes(drawPosition);

  if (!drawPosition) return { error: MISSING_DRAW_POSITION };

  // drawPosition may not be cleared if:
  // 1. drawPosition has been advanced by winning a matchUp
  // 2. drawPosition is paired with another drawPosition which has been advanced by winning a matchUp
  if (drawPositionIsActive) return { error: DRAW_POSITION_ACTIVE };

  let drawPositionCleared;
  positionAssignments.forEach(assignment => {
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
  matchUps.forEach(matchUp => {
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
        removeByeAndCleanUp({ matchUp, drawPosition });
      }
    }
  });

  return drawPositionCleared ? SUCCESS : { error: DRAW_POSITION_NOT_CLEARED };

  function removeByeAndCleanUp({ matchUp, drawPosition }) {
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
      drawDefinition,
      sourceMatchUpWinnerDrawPositionIndex,
    });

    // clear Directed Byes
    if (loserMatchUp && loserMatchUp.matchUpStatus === BYE) {
      // loserMatchUp must have both drawPositions defined
      const loserMatchUpDrawPositionsCount = loserMatchUp.drawPositions?.filter(
        f => f
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
