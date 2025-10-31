import { setMatchUpState } from '@Mutate/matchUps/matchUpStatus/setMatchUpState';
import { decorateResult } from '@Functions/global/decorateResult';
import { getAllDrawMatchUps } from '@Query/matchUps/drawMatchUps';

// constants
import { DEFAULTED, DOUBLE_WALKOVER, WALKOVER } from '@Constants/matchUpStatusConstants';
import { MISSING_MATCHUP } from '@Constants/errorConditionConstants';

export function progressExitStatus({
  sourceMatchUpStatusCodes,
  propagateExitStatus,
  sourceMatchUpStatus,
  loserParticipantId,
  tournamentRecord,
  drawDefinition,
  loserMatchUp,
  matchUpsMap,
  event,
}) {
  const stack = 'progressExitStatus';

  // RETIRED should not be propagated as an exit status
  const carryOverMatchUpStatus =
    ([WALKOVER, DEFAULTED].includes(sourceMatchUpStatus) && sourceMatchUpStatus) || WALKOVER;
  // get the updated inContext match ups so we have all the sides info
  // existing inContextDrawMatchUps is out of date
  const inContextMatchUps = getAllDrawMatchUps({
    inContext: true,
    drawDefinition,
    matchUpsMap,
  })?.matchUps;

  let loserMatchUpStatus = carryOverMatchUpStatus;

  //find the updated loser match up
  const updatedLoserMatchUp = inContextMatchUps?.find((m) => m.matchUpId === loserMatchUp?.matchUpId);
  const carriedOverStatusSides = updatedLoserMatchUp?._carriedOverStatusSides ?? [false, false];
  if (updatedLoserMatchUp?.matchUpId && loserMatchUpStatus) {
    let winningSide: number | undefined = undefined;
    //get rid of the double walkover special status codes
    //and replace them with simple string ones
    //it's a bit of a broad check but I think only double WO will set status codes as objects
    const statusCodes: string[] =
      updatedLoserMatchUp.matchUpStatusCodes?.map((sc) => (typeof sc === 'string' ? sc : 'WO')) ?? [];
    //find the loser participant side in the loser match up
    const loserParticipantSide = updatedLoserMatchUp.sides?.find((s) => s.participantId === loserParticipantId);
    //set the original status code to the correct side in the loser match
    if (loserParticipantSide?.sideNumber) {
      carriedOverStatusSides[loserParticipantSide.sideNumber-1] = true
      //find out how many assigned participants are already in the loser match up
      const participantsCount = updatedLoserMatchUp?.sides?.reduce((count, current) => {
        return current?.participantId ? count + 1 : count;
      }, 0);

      //if only one participant we need to bring over the status code and
      //set it as the only one, and assign the empty side as the winner.
      //We also consider outcomes from a double walkover in the main draw, which
      //will not bring over a participant but it will bring over the status code.
      //So we make sure there is only one participant and no existing status codes, otherwise
      //it should be set as a double walkover.
      if (participantsCount === 1 && statusCodes.length === 0) {
        winningSide = loserParticipantSide.sideNumber === 1 ? 2 : 1;
        //set the original status code from the original status codes
        //this is flawed a bit, or at least the TDesk ui, as even if there are two participants
        //for a WO/DEFAULT, the status code is always the first element.
        statusCodes[0] = sourceMatchUpStatusCodes[0];
      } else {
        //there was already a participant in the loser matchup
        //if the loser match is not already a WO or DEFAULT
        if (![WALKOVER, DEFAULTED].includes(loserMatchUp.matchUpStatus)) {
          //let's set the opponent as the winner
          winningSide = loserParticipantSide.sideNumber === 1 ? 2 : 1;
          //we still want to bring over the original status codes
          statusCodes[0] = sourceMatchUpStatusCodes[0];
        } else {
          //both participants are either WO or DEFAULT

          //workaround for status codes
          const currentStatusCode = statusCodes[0];
          //set the original status code to the correct participant in the loser match up
          statusCodes[loserParticipantSide.sideNumber - 1] = sourceMatchUpStatusCodes[0];
          const otherSide = loserParticipantSide.sideNumber === 1 ? 2 : 1;
          statusCodes[otherSide - 1] = currentStatusCode;

          loserMatchUpStatus = DOUBLE_WALKOVER;
          winningSide = undefined;
        }
      }
    }

    const result = setMatchUpState({
      matchUpStatus: loserMatchUpStatus,
      matchUpId: loserMatchUp.matchUpId,
      matchUpStatusCodes: statusCodes,
      allowChangePropagation: true,
      propagateExitStatus,
      tournamentRecord,
      drawDefinition,
      winningSide,
      event,
      carriedOverStatusSides,
    });
    return decorateResult({ result, stack, context: { progressExitStatus: true } });
  }

  return decorateResult({ result: { error: MISSING_MATCHUP }, stack });
}
