import { positionTargets } from '../positionGovernor/positionTargets';

export function isActiveDownstream(params) {
  const {
    inContextDrawMatchUps,
    targetData,
    drawDefinition,
    iteration = 0,
  } = params;

  if (iteration > 4) return false;

  const {
    targetMatchUps: { loserMatchUp, winnerMatchUp },
  } = targetData;

  const loserDrawPositionsCount =
    loserMatchUp?.drawPositions.filter(Boolean).length || 0;
  const winnerDrawPositionsCount =
    winnerMatchUp?.drawPositions.filter(Boolean).length || 0;

  if (
    loserMatchUp?.winningSide ||
    (winnerDrawPositionsCount === 2 && winnerMatchUp?.winningSide)
  )
    return true;

  if (!loserDrawPositionsCount && !winnerDrawPositionsCount) return false;

  let loserTargetData =
    loserMatchUp &&
    positionTargets({
      matchUpId: loserMatchUp.matchUpId,
      drawDefinition,
      inContextDrawMatchUps,
    });

  let winnerTargetData =
    winnerMatchUp &&
    positionTargets({
      matchUpId: winnerMatchUp.matchUpId,
      drawDefinition,
      inContextDrawMatchUps,
    });

  const loserActive =
    loserTargetData &&
    isActiveDownstream({
      inContextDrawMatchUps,
      drawDefinition,
      targetData: loserTargetData,
      iteration: iteration + 1,
    });

  const winnerActive =
    winnerTargetData &&
    isActiveDownstream({
      inContextDrawMatchUps,
      drawDefinition,
      targetData: winnerTargetData,
      iteration: iteration + 1,
    });

  return winnerActive || loserActive;
}
