import { getParticipantResults } from './getParticipantResults';
import { matchUpIsComplete } from '../matchUpIsComplete';
import { unique } from '../../../../utilities/arrays';
import { getGroupOrder } from './getGroupOrder';

import { POLICY_TYPE_ROUND_ROBIN_TALLY } from '../../../../constants/policyConstants';
import { MISSING_MATCHUPS } from '../../../../constants/errorConditionConstants';
import { BYE } from '../../../../constants/matchUpStatusConstants';

export function tallyParticipantResults({
  policyDefinitions,

  matchUpFormat,
  matchUps = [],
  subOrderMap,
  perPlayer,
}) {
  if (!Array.isArray(matchUps)) return { error: MISSING_MATCHUPS };

  const relevantMatchUps = matchUps.filter(
    (matchUp) => matchUp && matchUp.matchUpStatus !== BYE
  );

  const participantsCount =
    relevantMatchUps.length &&
    unique(relevantMatchUps.map(({ drawPositions }) => drawPositions).flat())
      .length;

  const bracketComplete =
    relevantMatchUps.filter(matchUpIsComplete).length ===
    relevantMatchUps.length;
  // if bracket is incomplete don't use expected matchUps perPlayer for calculating
  if (!bracketComplete) perPlayer = 0;

  const tallyPolicy =
    policyDefinitions && policyDefinitions[POLICY_TYPE_ROUND_ROBIN_TALLY];

  const completedMatchUps = matchUps.filter(matchUpIsComplete);
  const { participantResults, matchUpStatuses } = getParticipantResults({
    matchUps: completedMatchUps,
    matchUpFormat,
    tallyPolicy,
    perPlayer,
  });

  const groupOrder = getGroupOrder({
    matchUps: completedMatchUps,
    participantResults,
    participantsCount,
    matchUpStatuses,
    matchUpFormat,
    tallyPolicy,
    subOrderMap,
  });

  // do not add groupOrder if bracket is not complete
  if (bracketComplete && groupOrder) {
    groupOrder.forEach((finishingPosition) => {
      const result = participantResults[finishingPosition.participantId];
      result.groupOrder = finishingPosition.groupOrder;
    });
  }

  return { participantResults };
}
