import { getPairedPreviousMatchUp } from '../positionGovernor/getPairedPreviousMatchup';
import { decorateResult } from '../../../global/functions/decorateResult';
import { positionTargets } from '../positionGovernor/positionTargets';
import { findStructure } from '../../getters/findStructure';
import { modifyMatchUpScore } from './modifyMatchUpScore';
import { intersection, overlap } from '../../../utilities';
import {
  removeDirectedBye,
  removeDirectedWinner,
} from './removeDirectedParticipants';

import { pushGlobalLog } from '../../../global/functions/globalLog';

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

const keyColors = {
  drawPositionToRemove: 'green',
  iteration: 'brightred',
  winner: 'green',
  loser: 'brightred',
};

export function removeDoubleExit(params) {
  const {
    inContextDrawMatchUps,
    appliedPolicies,
    drawDefinition,
    matchUpsMap,
    targetData,
    matchUp,
  } = params;

  let { iteration = 0 } = params;
  iteration += 1;

  const stack = 'removeDoubleExit';

  pushGlobalLog({
    method: stack,
    color: 'brightyellow',
    iteration,
    keyColors,
  });

  const {
    targetLinks: { loserTargetLink },
    targetMatchUps: { loserMatchUp, winnerMatchUp, loserTargetDrawPosition },
  } = targetData;

  // only handles winnerMatchUps in the same structure
  if (winnerMatchUp) {
    const { stage, roundNumber, roundPosition } = winnerMatchUp;
    pushGlobalLog({
      winner: 'winner',
      stage,
      roundNumber,
      roundPosition,
      keyColors,
    });
    conditionallyRemoveDrawPosition({
      ...params,
      targetMatchUp: winnerMatchUp,
      sourceMatchUp: matchUp,
      iteration,
    });
  }

  if (loserMatchUp) {
    const inContextLoserMatchUp = inContextDrawMatchUps.find(
      ({ matchUpId }) => matchUpId === loserMatchUp.matchUpId
    );
    const { structure: loserStructure } = findStructure({
      drawDefinition,
      structureId: inContextLoserMatchUp.structureId,
    });
    const { stage, roundNumber, roundPosition, feedRound } = loserMatchUp;
    pushGlobalLog({
      loser: 'loser',
      stage,
      roundNumber,
      roundPosition,
      keyColors,
      feedRound,
    });
    if (appliedPolicies?.progression?.doubleExitPropagateBye) {
      const result = removeDirectedBye({
        targetLink: loserTargetLink,
        drawPosition: loserTargetDrawPosition,
        inContextDrawMatchUps,
        drawDefinition,
        matchUpsMap,
      });
      if (result.error) return decorateResult({ result, stack });
    } else {
      const result = conditionallyRemoveDrawPosition({
        ...params,
        structure: loserStructure,
        targetMatchUp: loserMatchUp,
        iteration,
      });
      if (result.error) return decorateResult({ result, stack });
    }
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
    iteration,
  } = params;

  const stack = 'conditionallyRemoveDrawPosition';
  pushGlobalLog({ method: stack });

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
  let pairedPreviousDoubleExit;
  let pairedPreviousMatchUp;
  let drawPositionToRemove;

  // targetMatchUp has context
  if (targetMatchUp.feedRound) {
    const nextWinnerDrawPositions =
      nextWinnerMatchUp?.drawPositions?.filter(Boolean);
    drawPositionToRemove = nextWinnerDrawPositions.find((drawPosition) =>
      targetMatchUp.drawPositions.includes(drawPosition)
    );
  } else if (!sourceMatchUp) {
    drawPositionToRemove = intersection(
      targetMatchUp.drawPositions,
      nextWinnerMatchUp.drawPositions
    )?.[0];
  } else {
    pairedPreviousMatchUp = getPairedPreviousMatchUp({
      structureId: structure.structureId,
      matchUp: sourceMatchUp,
      matchUpsMap,
    })?.pairedPreviousMatchUp;

    pairedPreviousDoubleExit = [DOUBLE_WALKOVER, DOUBLE_DEFAULT].includes(
      pairedPreviousMatchUp?.matchUpStatus
    );

    pairedPreviousDrawPositions =
      pairedPreviousMatchUp?.drawPositions?.filter(Boolean) || [];

    const pairedPreviousMatchUpComplete =
      [...completedMatchUpStatuses, BYE].includes(
        pairedPreviousMatchUp?.matchUpStatus
      ) || pairedPreviousMatchUp?.winningSide;

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
      drawPositionToRemove = possibleBranchDrawPositions.find((drawPosition) =>
        targetDrawPositions?.includes(drawPosition)
      );
    }
  }

  if (nextWinnerMatchUp && drawPositionToRemove) {
    const { stage, roundNumber, roundPosition } = nextWinnerMatchUp;
    pushGlobalLog({
      method: 'removeDirectedWinner',
      drawPositionToRemove,
      keyColors,
      color: 'brightgreen',
      stage,
      roundNumber,
      roundPosition,
    });
    const result = removeDirectedWinner({
      winningDrawPosition: drawPositionToRemove,
      winnerMatchUp: nextWinnerMatchUp,
      inContextDrawMatchUps,
      drawDefinition,
      matchUpsMap,
    });
    if (result.error) return decorateResult({ result, stack });
  }

  let result = removeDoubleExit({
    targetData: nextTargetData,
    matchUp: targetMatchUp,
    inContextDrawMatchUps,
    appliedPolicies,
    drawDefinition,
    matchUpsMap,
    structure,
    iteration,
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

  return { ...SUCCESS };
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
