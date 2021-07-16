import { getPairedPreviousMatchUp } from '../positionGovernor/getPairedPreviousMatchup';
import { completedMatchUpStatuses } from '../../../constants/matchUpStatusConstants';
import { positionTargets } from '../positionGovernor/positionTargets';
import { intersection } from '../../../utilities';
import {
  removeDirectedBye,
  removeDirectedWinner,
} from './removeDirectedParticipantsAndUpdateOutcome';

import { DRAW_POSITION_ASSIGNED } from '../../../constants/errorConditionConstants';
import { SUCCESS } from '../../../constants/resultConstants';

// 1. remove any BYE sent to linked consolation from matchUp
// 2. remove any advanced participant or BYE from winnerMatchUp
// 3. remove any BYE sent to linked consolation from winnerMatchUp

export function removeDoubleWalkover({
  drawDefinition,
  targetData,
  structure,
  matchUp: sourceMatchUp,

  matchUpsMap,
  inContextDrawMatchUps,
}) {
  const {
    targetLinks: { loserTargetLink },
    targetMatchUps: { loserMatchUp, winnerMatchUp, loserTargetDrawPosition },
  } = targetData;

  if (loserMatchUp) {
    removeDirectedBye({
      targetLink: loserTargetLink,
      drawPosition: loserTargetDrawPosition,
      drawDefinition,
      inContextDrawMatchUps,

      matchUpsMap,
    });
  }

  // only handles winnerMatchUps in the same structure
  if (winnerMatchUp) {
    removePropagatedDoubleWalkover({
      drawDefinition,
      structure,
      sourceMatchUp,
      winnerMatchUp,
      inContextDrawMatchUps,

      matchUpsMap,
    });
  }

  return { ...SUCCESS };
}

function removePropagatedDoubleWalkover({
  drawDefinition,
  structure,
  sourceMatchUp,
  winnerMatchUp,

  matchUpsMap,
  inContextDrawMatchUps,
}) {
  const targetData = positionTargets({
    matchUpId: winnerMatchUp.matchUpId,
    structure,
    drawDefinition,
    inContextDrawMatchUps,
  });
  const {
    targetMatchUps,
    targetLinks: { loserTargetLink: nextLoserTargetLink },
  } = targetData;
  const {
    winnerMatchUp: nextWinnerMatchUp,
    loserMatchUp: nextLoserMatchUp,
    loserTargetDrawPosition: nextLoserTargetDrawPosition,
  } = targetMatchUps;

  if (nextWinnerMatchUp) {
    const { pairedPreviousMatchUp } = getPairedPreviousMatchUp({
      matchUp: sourceMatchUp,
      structureId: structure.structureId,

      matchUpsMap,
    });
    const pairedPreviousMatchUpComplete =
      completedMatchUpStatuses.includes(pairedPreviousMatchUp?.matchUpStatus) ||
      pairedPreviousMatchUp?.winningSide;

    if (pairedPreviousMatchUpComplete) {
      const sourceDrawPositions = sourceMatchUp?.drawPositions || [];
      let targetDrawPositions = nextWinnerMatchUp.drawPositions.filter(
        (f) => f
      );
      if (intersection(sourceDrawPositions, targetDrawPositions).length) {
        targetDrawPositions = targetDrawPositions.filter(
          (drawPosition) => !sourceDrawPositions.includes(drawPosition)
        );
      }

      if (targetDrawPositions.length > 1) {
        return { error: DRAW_POSITION_ASSIGNED };
      }
      const drawPositionToRemove = targetDrawPositions[0];
      if (drawPositionToRemove) {
        const targetData = positionTargets({
          matchUpId: nextWinnerMatchUp.matchUpId,
          structure,
          drawDefinition,
          inContextDrawMatchUps,
        });
        const {
          targetMatchUps: { winnerMatchUp: subsequentWinnerMatchUp },
        } = targetData;

        const targetWinnerMatchUp =
          (subsequentWinnerMatchUp?.drawPositions.includes(
            drawPositionToRemove
          ) &&
            subsequentWinnerMatchUp) ||
          nextWinnerMatchUp;

        const result = removeDirectedWinner({
          winnerMatchUp: targetWinnerMatchUp,
          drawDefinition,
          winningDrawPosition: drawPositionToRemove,

          matchUpsMap,
          inContextDrawMatchUps,
        });
        if (result.error) return result;
      }
    }
  }

  if (nextLoserMatchUp) {
    removeDirectedBye({
      targetLink: nextLoserTargetLink,
      drawPosition: nextLoserTargetDrawPosition,
      drawDefinition,

      matchUpsMap,
      inContextDrawMatchUps,
    });
  }
}
