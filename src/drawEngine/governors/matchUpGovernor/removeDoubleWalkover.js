import { getPairedPreviousMatchUp } from '../positionGovernor/getPairedPreviousMatchup';
import { positionTargets } from '../positionGovernor/positionTargets';
import { modifyMatchUpScore } from './modifyMatchUpScore';
import { addNotice } from '../../../global/globalState';
import { intersection } from '../../../utilities';
import {
  removeDirectedBye,
  removeDirectedWinner,
} from './removeDirectedParticipantsAndUpdateOutcome';

import { MODIFY_MATCHUP } from '../../../constants/topicConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import {
  BYE,
  completedMatchUpStatuses,
  DOUBLE_WALKOVER,
  TO_BE_PLAYED,
  WALKOVER,
} from '../../../constants/matchUpStatusConstants';

// 1. remove any BYE sent to linked consolation from matchUp
// 2. remove any advanced participant or BYE from winnerMatchUp
// 3. remove any BYE sent to linked consolation from winnerMatchUp

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
    let result = modifyMatchUpScore({
      ...params,
      removeScore: true,
      removeWinningSide: true,
      matchUp: noContextWinnerMatchUp,
      matchUpId: winnerMatchUp.matchUpId,
    });
    if (result.error) return result;

    result = removePropagatedDoubleWalkover({
      drawDefinition,
      structure,

      winnerMatchUp,
      sourceMatchUp: matchUp,

      matchUpsMap,
      inContextDrawMatchUps,
    });
    if (result.error) return result;
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

      inContextDrawMatchUps,
      matchUpsMap,
    });
    const pairedPreviousDrawPositions =
      pairedPreviousMatchUp?.drawPositions.filter(Boolean) || [];
    const pairedPreviousMatchUpComplete =
      [...completedMatchUpStatuses, BYE].includes(
        pairedPreviousMatchUp?.matchUpStatus
      ) || pairedPreviousMatchUp?.winningSide;

    // TODO: This should be replaced with an algorithm which traverses winnerMatchUps until a produced WALKOVER is encountered
    // as the winnerMatchUps are traversed a record of matchUps to be modified is kept
    // when the produced WALKVER is encountered it must be determined whether it is doubly produced before it can be removed
    if (
      nextWinnerMatchUp.matchUpStatus === WALKOVER &&
      winnerMatchUp.matchUpStatus === DOUBLE_WALKOVER &&
      sourceMatchUp.matchUpStatus === DOUBLE_WALKOVER
    ) {
      const noContextNextWinnerMatchUp = matchUpsMap?.drawMatchUps.find(
        (matchUp) => matchUp.matchUpId === nextWinnerMatchUp.matchUpId
      );
      noContextNextWinnerMatchUp.matchUpStatus = TO_BE_PLAYED;
      addNotice({
        topic: MODIFY_MATCHUP,
        payload: { matchUp: noContextNextWinnerMatchUp },
      });
    }

    if (pairedPreviousMatchUpComplete) {
      const sourceDrawPositions = sourceMatchUp?.drawPositions || [];
      let targetDrawPositions = nextWinnerMatchUp.drawPositions.filter(Boolean);
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

      if (drawPositionToRemove) {
        const targetData = positionTargets({
          matchUpId: nextWinnerMatchUp.matchUpId,
          inContextDrawMatchUps,
          drawDefinition,
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
    const result = removeDirectedBye({
      targetLink: nextLoserTargetLink,
      drawPosition: nextLoserTargetDrawPosition,
      drawDefinition,

      matchUpsMap,
      inContextDrawMatchUps,
    });
    if (result.error) return result;
  }

  return { ...SUCCESS };
}
