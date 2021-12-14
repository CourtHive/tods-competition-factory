import { getPairedPreviousMatchUp } from '../positionGovernor/getPairedPreviousMatchup';
import { positionTargets } from '../positionGovernor/positionTargets';
import { modifyMatchUpScore } from './modifyMatchUpScore';
import { overlap } from '../../../utilities';
import {
  removeDirectedBye,
  removeDirectedWinner,
} from './removeDirectedParticipantsAndUpdateOutcome';

import { SUCCESS } from '../../../constants/resultConstants';
import {
  BYE,
  completedMatchUpStatuses,
  DOUBLE_WALKOVER,
  TO_BE_PLAYED,
  WALKOVER,
} from '../../../constants/matchUpStatusConstants';

export function removeDoubleWalkover(params) {
  const {
    inContextDrawMatchUps,
    drawDefinition,
    matchUpsMap,
    targetData,
    structure,
    matchUp,
  } = params;

  const {
    targetLinks: { loserTargetLink },
    targetMatchUps: { loserMatchUp, winnerMatchUp, loserTargetDrawPosition },
  } = targetData;

  if (loserMatchUp) {
    const result = removeDirectedBye({
      targetLink: loserTargetLink,
      drawPosition: loserTargetDrawPosition,
      drawDefinition,
      inContextDrawMatchUps,

      matchUpsMap,
    });
    if (result.error) return result;
  }

  // only handles winnerMatchUps in the same structure
  if (winnerMatchUp) {
    const nextTargetData = positionTargets({
      matchUpId: winnerMatchUp.matchUpId,
      inContextDrawMatchUps,
      drawDefinition,
    });

    const {
      targetMatchUps: { winnerMatchUp: nextWinnerMatchUp },
    } = nextTargetData;

    const noContextWinnerMatchUp = matchUpsMap?.drawMatchUps.find(
      (matchUp) => matchUp.matchUpId === winnerMatchUp.matchUpId
    );

    let pairedPreviousDrawPositions = [];
    let pairedPreviousMatchUpComplete;
    let pairedPreviousWOWO;

    // winnerMatchUp has context
    if (winnerMatchUp.feedRound) {
      pairedPreviousDrawPositions =
        nextWinnerMatchUp?.drawPositions?.filter(Boolean);
      pairedPreviousMatchUpComplete = true;
    } else {
      const { pairedPreviousMatchUp } = getPairedPreviousMatchUp({
        structureId: structure.structureId,
        matchUpsMap,
        matchUp,
      });
      pairedPreviousWOWO =
        pairedPreviousMatchUp?.matchUpStatus === DOUBLE_WALKOVER;

      pairedPreviousDrawPositions =
        pairedPreviousMatchUp?.drawPositions?.filter(Boolean) || [];
      pairedPreviousMatchUpComplete =
        [...completedMatchUpStatuses, BYE].includes(
          pairedPreviousMatchUp?.matchUpStatus
        ) || pairedPreviousMatchUp?.winningSide;
    }

    if (pairedPreviousMatchUpComplete) {
      const sourceDrawPositions = matchUp.drawPositions || [];
      let targetDrawPositions = winnerMatchUp.drawPositions?.filter(Boolean);
      if (overlap(sourceDrawPositions, targetDrawPositions)) {
        targetDrawPositions = targetDrawPositions?.filter(
          (drawPosition) => !sourceDrawPositions.includes(drawPosition)
        );
      }

      const possibleBranchDrawPositions = sourceDrawPositions.concat(
        pairedPreviousDrawPositions
      );
      const drawPositionToRemove = possibleBranchDrawPositions.find(
        (drawPosition) => targetDrawPositions?.includes(drawPosition)
      );

      if (nextWinnerMatchUp && drawPositionToRemove) {
        const result = removeDirectedWinner({
          winningDrawPosition: drawPositionToRemove,
          winnerMatchUp: nextWinnerMatchUp,
          inContextDrawMatchUps,
          drawDefinition,
          matchUpsMap,
        });
        if (result.error) return result;
      }
    }

    removeDoubleWalkover({
      targetData: nextTargetData,
      matchUp: winnerMatchUp,
      inContextDrawMatchUps,
      drawDefinition,
      matchUpsMap,
      structure,
    });

    let matchUpStatus =
      [WALKOVER, DOUBLE_WALKOVER].includes(
        noContextWinnerMatchUp?.matchUpStatus
      ) && pairedPreviousWOWO
        ? WALKOVER
        : TO_BE_PLAYED;

    const removeScore = !pairedPreviousWOWO;
    let result = modifyMatchUpScore({
      ...params,
      matchUpStatus,
      removeScore,
      score: {
        scoreStringSide1: '',
        scoreStringSide2: '',
        sets: undefined,
      },
      removeWinningSide: true,
      matchUp: noContextWinnerMatchUp,
      matchUpId: winnerMatchUp.matchUpId,
    });

    if (result.error) return result;
  }

  return { ...SUCCESS };
}
