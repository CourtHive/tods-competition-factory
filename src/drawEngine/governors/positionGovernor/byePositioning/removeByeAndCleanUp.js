import { numericSort } from '../../../../utilities';
import { removeMatchUpDrawPosition } from '../../matchUpGovernor/matchUpDrawPosition';
import { setMatchUpStatus } from '../../matchUpGovernor/setMatchUpStatus';
import { clearDrawPosition } from '../positionClear';
import { positionTargets } from '../positionTargets';

import { MISSING_DRAW_POSITIONS } from '../../../../constants/errorConditionConstants';
import {
  BYE,
  TO_BE_PLAYED,
} from '../../../../constants/matchUpStatusConstants';

/**
 *
 * This function should be self referencing and not create circular dependencies
 *
 */
export function removeByeAndCleanUp({
  drawDefinition,
  matchUp,
  structure,
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
