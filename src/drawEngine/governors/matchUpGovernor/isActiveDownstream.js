import { positionTargets } from '../positionGovernor/positionTargets';

export function isActiveDownstream(params) {
  const { inContextDrawMatchUps, targetData, drawDefinition } = params;

  const {
    targetMatchUps: { loserMatchUp, winnerMatchUp },
  } = targetData;

  const winnerDrawPositionsCount =
    winnerMatchUp?.drawPositions?.filter(Boolean).length || 0;

  if (
    loserMatchUp?.winningSide ||
    (winnerDrawPositionsCount === 2 && winnerMatchUp?.winningSide)
  )
    return true;

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
      inContextDrawMatchUps,
      drawDefinition,
    });

  const loserActive =
    loserTargetData &&
    isActiveDownstream({
      inContextDrawMatchUps,
      targetData: loserTargetData,
      drawDefinition,
    });

  const winnerActive =
    winnerTargetData &&
    isActiveDownstream({
      inContextDrawMatchUps,
      targetData: winnerTargetData,
      drawDefinition,
    });

  const isActive = !!(winnerActive || loserActive);

  return isActive;
}
