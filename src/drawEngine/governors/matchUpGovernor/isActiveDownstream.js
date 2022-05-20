import { positionTargets } from '../positionGovernor/positionTargets';
import { getDevContext } from '../../../global/state/globalState';

import { FIRST_MATCHUP } from '../../../constants/drawDefinitionConstants';
import { BYE, WALKOVER } from '../../../constants/matchUpStatusConstants';

export function isActiveDownstream(params) {
  const { inContextDrawMatchUps, targetData, drawDefinition, relevantLink } =
    params;

  const fmlcBYE =
    relevantLink?.linkCondition === FIRST_MATCHUP &&
    targetData?.matchUp?.matchUpStatus === BYE;

  if (fmlcBYE) return false;

  const {
    targetMatchUps: { loserMatchUp, winnerMatchUp },
    targetLinks,
  } = targetData;

  if (getDevContext({ qualifying: true })) console.log({ targetData });

  const loserMatchUpWalkover = [WALKOVER].includes(loserMatchUp?.matchUpStatus);

  const winnerDrawPositionsCount =
    winnerMatchUp?.drawPositions?.filter(Boolean).length || 0;

  if (
    (loserMatchUp?.winningSide && !loserMatchUpWalkover) ||
    (winnerDrawPositionsCount === 2 && winnerMatchUp?.winningSide)
  ) {
    return true;
  }

  let loserTargetData =
    loserMatchUp &&
    positionTargets({
      matchUpId: loserMatchUp.matchUpId,
      inContextDrawMatchUps,
      drawDefinition,
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
      relevantLink: targetLinks?.loserTargetLink,
      targetData: loserTargetData,
      inContextDrawMatchUps,
      drawDefinition,
    });

  const winnerActive =
    winnerTargetData &&
    isActiveDownstream({
      targetData: winnerTargetData,
      inContextDrawMatchUps,
      drawDefinition,
    });

  const isActive = !!(winnerActive || loserActive);

  return isActive;
}
