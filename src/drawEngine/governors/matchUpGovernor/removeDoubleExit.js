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
    appliedPolicies,
    drawDefinition,
    matchUpsMap,
    targetData,
    matchUp,
  } = params;

  const stack = 'removeDoubleExit';

  const {
    targetLinks: { loserTargetLink },
    targetMatchUps: { loserMatchUp, winnerMatchUp, loserTargetDrawPosition },
  } = targetData;

  if (loserMatchUp) {
    if (appliedPolicies?.progression?.doubleExitPropagateLoserExit) {
      conditionallyRemoveDrawPosition({
        ...params,
        targetMatchUp: loserMatchUp,
        sourceMatchUp: matchUp,
      });
    } else {
      const result = removeDirectedBye({
        targetLink: loserTargetLink,
        drawPosition: loserTargetDrawPosition,
        inContextDrawMatchUps,
        drawDefinition,
        matchUpsMap,
      });
      if (result.error) return decorateResult({ result, stack });
    }
  }

  // only handles winnerMatchUps in the same structure
  if (winnerMatchUp) {
    conditionallyRemoveDrawPosition({
      ...params,
      targetMatchUp: winnerMatchUp,
      sourceMatchUp: matchUp,
    });
  }

  return decorateResult({ result: { ...SUCCESS }, stack });
}

export function conditionallyRemoveDrawPosition(params) {
  const {
    inContextDrawMatchUps,
    appliedPolicies,
    drawDefinition,
    sourceMatchUp,
    targetMatchUp,
    matchUpsMap,
    structure,
  } = params;

  const stack = 'conditionallyRemoveDrawPosition';

  // only handles winnerMatchUps in the same structure
  const nextTargetData = positionTargets({
    matchUpId: targetMatchUp.matchUpId,
    inContextDrawMatchUps,
    drawDefinition,
  });

  const {
    targetMatchUps: { winnerMatchUp: nextWinnerMatchUp },
  } = nextTargetData;

  const noContextTargetMatchUp = matchUpsMap?.drawMatchUps.find(
    (matchUp) => matchUp.matchUpId === targetMatchUp.matchUpId
  );

  let pairedPreviousDrawPositions = [];
  let pairedPreviousMatchUpComplete;
  let pairedPreviousDoubleExit;

  // targetMatchUp has context
  if (targetMatchUp.feedRound) {
    pairedPreviousDrawPositions =
      nextWinnerMatchUp?.drawPositions?.filter(Boolean);
    pairedPreviousMatchUpComplete = true;
  } else {
    const { pairedPreviousMatchUp } = getPairedPreviousMatchUp({
      structureId: structure.structureId,
      matchUp: sourceMatchUp,
      matchUpsMap,
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
    const sourceDrawPositions = sourceMatchUp.drawPositions || [];
    let targetDrawPositions = targetMatchUp.drawPositions?.filter(Boolean);
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
    matchUp: targetMatchUp,
    inContextDrawMatchUps,
    appliedPolicies,
    drawDefinition,
    matchUpsMap,
    structure,
  });
  if (result.error) return decorateResult({ result, stack });

  const matchUpStatus = getMatchUpStatus({
    pairedPreviousDoubleExit,
    noContextTargetMatchUp,
  });

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
    matchUp: noContextTargetMatchUp,
    matchUpId: targetMatchUp.matchUpId,
    matchUpStatusCodes: [],
  });

  if (result.error) return decorateResult({ result, stack });
}

function getMatchUpStatus({
  pairedPreviousDoubleExit,
  noContextTargetMatchUp,
}) {
  if (noContextTargetMatchUp.matchUpStatus === BYE) return BYE;
  if (!pairedPreviousDoubleExit) return TO_BE_PLAYED;
  return [DOUBLE_DEFAULT, DEFAULTED].includes(
    noContextTargetMatchUp?.matchUpStatus
  )
    ? DEFAULTED
    : WALKOVER;
}
