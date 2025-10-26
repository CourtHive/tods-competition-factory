import { positionTargets } from '@Query/matchUp/positionTargets';

// constants
import { BYE, DEFAULTED, TO_BE_PLAYED, WALKOVER } from '@Constants/matchUpStatusConstants';
import { FIRST_MATCHUP } from '@Constants/drawDefinitionConstants';

export function isActiveDownstream(params) {
  // relevantLink is passed in iterative calls (see below)
  const { inContextDrawMatchUps, targetData, drawDefinition, relevantLink, matchUpStatus, score, winningSide } = params;

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
  //to identify a propagated exit (WO/DEFAULT) a match will be WO/DEFAULT, have a winning side,
  //and have only one participant (the WO/DF player).
  const loserMatchUpParticipantsCount =
    loserMatchUp?.sides?.reduce((acc, current) => (current?.participant ? ++acc : acc), 0) ?? 0;
  //
  //the problem is that clearing a score in the main draw does not completely clear the loser match
  //if the loser match is a propagated exit. This is becuase it does not set the match status to TO_BE_PLAYED
  //and it does not clear the status codes. Based on the discussion with Charles I thought we would not manage the undo
  //so here I was attempting to stop the user clearing a score if a downstream match was a propagated exit.
  const isLoserMatchUpAPropagatedExitStatus =
    loserMatchUp?.winningSide &&
    [DEFAULTED, WALKOVER].includes(loserMatchUp?.matchUpStatus) &&
    propagatedLoserParticipant &&
    loserMatchUpParticipantsCount === 1;
  //we want to figure out if the command is for clearing the score as this
  //can have downstream effects.
  const isClearScore =
    matchUpStatus === TO_BE_PLAYED && score?.scoreStringSide1 === '' && score?.scoreStringSide2 === '' && !winningSide;

  const winnerDrawPositionsCount = winnerMatchUp?.drawPositions?.filter(Boolean).length || 0;

  // if a winnerMatchUp contains a WALKOVER and its source matchUps have no winningSides it cannot be considered active
  // unless one of its downstream matchUps is active

  if (
    //if there is a downstream propagated exit and we are trying to clear the score we stop the user
    //by marking the downstream as active
    (isLoserMatchUpAPropagatedExitStatus && isClearScore) ||
    //if the downstream has not a propagated exit we run the existing checks,
    //otherwise we let them set the score. This is to counter act the fact
    //that propagated exit status matches can be marked as WALKOVER with only one
    //participant. This would have been marked as an active downstream before.
    (!isLoserMatchUpAPropagatedExitStatus &&
      ((loserMatchUp?.winningSide && !loserMatchUpExit) ||
        (winnerMatchUp?.winningSide &&
          winnerDrawPositionsCount === 2 &&
          (!winnerMatchUp.feedRound || ![WALKOVER, DEFAULTED].includes(winnerMatchUp?.matchUpStatus)))))
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
