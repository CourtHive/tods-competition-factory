import { getPairedPreviousMatchUp } from '../positionGovernor/getPairedPreviousMatchup';
import { decorateResult } from '../../../global/functions/decorateResult';
import { positionTargets } from '../positionGovernor/positionTargets';
import { modifyMatchUpScore } from './modifyMatchUpScore';
import { overlap } from '../../../utilities';
import {
  removeDirectedBye,
  removeDirectedWinner,
} from './removeDirectedParticipants';

import { SUCCESS } from '../../../constants/resultConstants';
import {
  BYE,
  completedMatchUpStatuses,
  DEFAULTED,
  DOUBLE_DEFAULT,
  DOUBLE_WALKOVER,
  TO_BE_PLAYED,
  WALKOVER,
} from '../../../constants/matchUpStatusConstants';

export function removeDoubleExit(params) {
  const {
    inContextDrawMatchUps,
    drawDefinition,
    matchUpsMap,
    targetData,
    structure,
    matchUp,
  } = params;

  const stack = 'removeDoubleExit';

  const {
    targetLinks: { loserTargetLink },
    targetMatchUps: { loserMatchUp, winnerMatchUp, loserTargetDrawPosition },
  } = targetData;

  if (loserMatchUp) {
    // TODO: refactor winnerMatchUp condition to re-use for loserMatchUp condition
    const result = removeDirectedBye({
      targetLink: loserTargetLink,
      drawPosition: loserTargetDrawPosition,
      inContextDrawMatchUps,
      drawDefinition,
      matchUpsMap,
    });
    if (result.error) return decorateResult({ result, stack });
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
    let pairedPreviousDoubleExit;

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
      pairedPreviousDoubleExit = [DOUBLE_WALKOVER, DOUBLE_DEFAULT].includes(
        pairedPreviousMatchUp?.matchUpStatus
      );

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
        if (result.error) return decorateResult({ result, stack });
      }
    }

    let result = removeDoubleExit({
      targetData: nextTargetData,
      matchUp: winnerMatchUp,
      inContextDrawMatchUps,
      drawDefinition,
      matchUpsMap,
      structure,
    });
    if (result.error) return decorateResult({ result, stack });

    const matchUpStatus = !pairedPreviousDoubleExit
      ? TO_BE_PLAYED
      : [DOUBLE_DEFAULT, DEFAULTED].includes(
          noContextWinnerMatchUp?.matchUpStatus
        )
      ? DEFAULTED
      : WALKOVER;

    const removeScore = !pairedPreviousDoubleExit;
    result = modifyMatchUpScore({
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
      matchUpStatusCodes: [],
    });

    if (result.error) return decorateResult({ result, stack });
  }

  return decorateResult({ result: { ...SUCCESS }, stack });
}
