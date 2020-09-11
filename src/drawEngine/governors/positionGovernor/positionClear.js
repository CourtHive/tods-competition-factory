import { drawEngine } from '../../../drawEngine';
import { numericSort } from '../../../utilities';
import { findStructure } from '../../getters/structureGetter';
import { getAllStructureMatchUps } from '../../getters/getMatchUps';
import { positionTargets } from '../../governors/positionGovernor/positionTargets';
import { removeMatchUpDrawPosition } from '../../governors/matchUpGovernor/matchUpDrawPosition';

import {
  structureAssignedDrawPositions,
  structureActiveDrawPositions,
} from '../../getters/positionsGetter';

import { SUCCESS } from '../../../constants/resultConstants';
import { BYE, TO_BE_PLAYED } from '../../../constants/matchUpStatusConstants';

export function clearDrawPosition({
  policies,
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

  if (!drawPosition) return { error: 'Missing drawPosition' };

  // drawPosition may not be cleared if:
  // 1. drawPosition has been advanced by winning a matchUp
  // 2. drawPosition is paired with another drawPosition which has been advanced by winning a matchUp
  if (drawPositionIsActive)
    return { error: 'Cannot clear an active drawPosition' };

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
    structure,
    policies,
    matchUpFilters,
    inContext: true,
  });
  matchUps.forEach(matchUp => {
    if (matchUp.drawPositions.includes(drawPosition)) {
      const isByeMatchUp = matchUp.drawPositions.reduce(
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
      delete matchUp.matchUpStatus;
    }
  });

  return drawPositionCleared ? SUCCESS : { error: 'drawPosition not cleared' };

  function removeByeAndCleanUp({ matchUp, drawPosition }) {
    const { matchUpId } = matchUp;
    drawEngine.setMatchUpStatus({ matchUpId, matchUpStatus: TO_BE_PLAYED });

    // if there is a linked draw then BYE must also be placed there
    // This must be propagated through compass draw, for instance
    const pairedDrawPosition = matchUp.drawPositions.reduce(
      (pairedDrawPosition, currentDrawPosition) => {
        return currentDrawPosition !== drawPosition
          ? currentDrawPosition
          : pairedDrawPosition;
      },
      undefined
    );

    const {
      targetLinks: { loserTargetLink, winnerTargetLink },
      targetMatchUps: { loserMatchUp, winnerMatchUp },
    } = positionTargets({ drawDefinition, matchUpId });

    // clear Directed Byes
    if (loserMatchUp && loserMatchUp.matchUpStatus === BYE) {
      // loserMatchUp must have both drawPositions defined
      const loserMatchUpDrawPositionsCount = loserMatchUp.drawPositions.filter(
        f => f
      ).length;
      if (loserMatchUpDrawPositionsCount !== 2)
        return { error: 'Missing drawPositions in loserMatchUp' };
      // drawPositions must be in numerical order
      loserMatchUp.drawPositions = loserMatchUp.drawPositions.sort(numericSort);
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
