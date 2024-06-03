import { positionTargets } from '@Query/matchUp/positionTargets';

// constants
import { BYE, DEFAULTED, WALKOVER } from '@Constants/matchUpStatusConstants';
import { FIRST_MATCHUP } from '@Constants/drawDefinitionConstants';

export function isActiveDownstream(params) {
  // relevantLink is passed in iterative calls (see below)
  const { inContextDrawMatchUps, targetData, drawDefinition, relevantLink } = params;

  const fmlcBYE = relevantLink?.linkCondition === FIRST_MATCHUP && targetData?.matchUp?.matchUpStatus === BYE;
  if (fmlcBYE) return false;

  const {
    targetMatchUps: { loserMatchUp, winnerMatchUp },
    targetLinks,
  } = targetData;

  const loserTargetData =
    loserMatchUp &&
    positionTargets({
      matchUpId: loserMatchUp.matchUpId,
      inContextDrawMatchUps,
      drawDefinition,
    });

  // NOTE: produced WALKOVER, DEFAULTEED fed into consolation structures should NOT be considered active
  // IF: the loserMatchUp has no further downstream matchUps or there is no propagated loserParticipant (e.g. DOUBLE_EXIT)

  const loserExitPropagation = loserTargetData?.targetMatchUps?.loserMatchUp;
  const loserIndex = loserTargetData?.targetMatchUps?.loserMatchUpDrawPositionIndex;
  const propagatedLoserParticipant = loserExitPropagation?.sides[loserIndex]?.participant;
  const loserMatchUpExit = [DEFAULTED, WALKOVER].includes(loserMatchUp?.matchUpStatus) && !propagatedLoserParticipant;

  const winnerDrawPositionsCount = winnerMatchUp?.drawPositions?.filter(Boolean).length || 0;

  // if a winnerMatchUp contains a WALKOVER and its source matchUps have no winningSides it cannot be considered active
  // unless one of its downstream matchUps is active

  if (
    (loserMatchUp?.winningSide && !loserMatchUpExit) ||
    (winnerMatchUp?.winningSide &&
      winnerDrawPositionsCount === 2 &&
      (!winnerMatchUp.feedRound || ![WALKOVER, DEFAULTED].includes(winnerMatchUp?.matchUpStatus)))
  ) {
    return true;
  }

  const winnerTargetData =
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

  return !!(winnerActive || loserActive);
}
