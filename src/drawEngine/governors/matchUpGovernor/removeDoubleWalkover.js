import { getPairedPreviousMatchUp } from '../positionGovernor/getPairedPreviousMatchup';
import { positionTargets } from '../positionGovernor/positionTargets';
import { modifyMatchUpScore } from './modifyMatchUpScore';
import { intersection } from '../../../utilities';
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
    drawDefinition,
    targetData,
    structure,
    matchUp,

    matchUpsMap,
    inContextDrawMatchUps,
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
    const noContextWinnerMatchUp = matchUpsMap?.drawMatchUps.find(
      (matchUp) => matchUp.matchUpId === winnerMatchUp.matchUpId
    );
    const { pairedPreviousMatchUp } = getPairedPreviousMatchUp({
      matchUp,
      structureId: structure.structureId,
      matchUpsMap,
    });
    const pairedPreviousWOWO =
      pairedPreviousMatchUp?.matchUpStatus === DOUBLE_WALKOVER;

    const pairedPreviousDrawPositions =
      pairedPreviousMatchUp?.drawPositions.filter(Boolean) || [];
    const pairedPreviousMatchUpComplete =
      [...completedMatchUpStatuses, BYE].includes(
        pairedPreviousMatchUp?.matchUpStatus
      ) || pairedPreviousMatchUp?.winningSide;

    /*
    console.log(matchUp.roundNumber, {
      pairedPreviousWOWO,
      pairedPreviousMatchUpComplete,
    });
    */

    const nextTargetData = positionTargets({
      matchUpId: winnerMatchUp.matchUpId,
      drawDefinition,
      inContextDrawMatchUps,
    });

    const {
      targetMatchUps: { winnerMatchUp: nextWinnerMatchUp },
    } = nextTargetData;

    if (pairedPreviousMatchUpComplete) {
      const sourceDrawPositions = matchUp.drawPositions || [];
      let targetDrawPositions = winnerMatchUp.drawPositions.filter(Boolean);
      if (intersection(sourceDrawPositions, targetDrawPositions).length) {
        targetDrawPositions = targetDrawPositions.filter(
          (drawPosition) => !sourceDrawPositions.includes(drawPosition)
        );
      }

      const possibleBranchDrawPositions = sourceDrawPositions.concat(
        pairedPreviousDrawPositions
      );
      const drawPositionToRemove = possibleBranchDrawPositions.find(
        (drawPosition) => targetDrawPositions.includes(drawPosition)
      );

      if (nextWinnerMatchUp && drawPositionToRemove) {
        const result = removeDirectedWinner({
          winnerMatchUp: nextWinnerMatchUp,
          drawDefinition,
          winningDrawPosition: drawPositionToRemove,

          matchUpsMap,
          inContextDrawMatchUps,
        });
        if (result.error) return result;
      }
    }

    removeDoubleWalkover({
      drawDefinition,
      targetData: nextTargetData,
      structure,
      matchUp: winnerMatchUp,
      matchUpsMap,
      inContextDrawMatchUps,
    });

    let mathcUpStatus =
      noContextWinnerMatchUp?.matchUpStatus === WALKOVER && pairedPreviousWOWO
        ? WALKOVER
        : TO_BE_PLAYED;

    let result = modifyMatchUpScore({
      ...params,
      mathcUpStatus,
      removeScore: !pairedPreviousWOWO,
      removeWinningSide: true,
      matchUp: noContextWinnerMatchUp,
      matchUpId: winnerMatchUp.matchUpId,
    });
    if (result.error) return result;
  }

  return { ...SUCCESS };
}
