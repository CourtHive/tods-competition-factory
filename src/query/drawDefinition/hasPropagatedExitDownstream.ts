import { DOUBLE_WALKOVER } from '@Constants/matchUpStatusConstants';
import { isExit } from '@Validators/isExit';

export function hasPropagatedExitDownstream(params) {
  // relevantLink is passed in iterative calls (see below)
  const { targetData, matchUpsMap } = params;

  const {
    targetMatchUps: { loserMatchUp },
  } = targetData;

  const isLoserMatchUpWO = isExit(loserMatchUp?.matchUpStatus);
  const hasLoserMatchUpUpstreamWOMatches = !!matchUpsMap?.drawMatchUps.find(
    (m) => m.loserMatchUpId === loserMatchUp?.matchUpId && isExit(m.matchUpStatus),
  );

  //if there is a downstream match with two propagated exits we mark it as active
  return (
    (hasLoserMatchUpUpstreamWOMatches && loserMatchUp?.matchUpStatus === DOUBLE_WALKOVER) ||
    //if there is a downstream propagated exit and we are trying to clear the score we stop the user
    //by marking the downstream as active
    (hasLoserMatchUpUpstreamWOMatches && isLoserMatchUpWO)
  );
}
