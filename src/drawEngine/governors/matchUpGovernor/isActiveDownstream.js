import { positionTargets } from '../positionGovernor/positionTargets';

export function isActiveDownstream(params) {
  const { inContextDrawMatchUps, targetData, drawDefinition } = params;

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
    });

  const winnerActive =
    winnerTargetData &&
    isActiveDownstream({
      inContextDrawMatchUps,
      drawDefinition,
      targetData: winnerTargetData,
    });

  return !!(winnerActive || loserActive);
}
