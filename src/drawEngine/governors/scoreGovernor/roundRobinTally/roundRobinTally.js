import { getParticipantResults } from './getParticipantResults';
import { unique } from '../../../../utilities/arrays';
import { getGroupOrder } from './getGroupOrder';

import { MISSING_MATCHUPS } from '../../../../constants/errorConditionConstants';
import {
  BYE,
  completedMatchUpStatuses,
} from '../../../../constants/matchUpStatusConstants';

export function tallyParticipantResults({
  policyDefinition,

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

  const matchUpComplete = (matchUp) =>
    completedMatchUpStatuses.includes(matchUp?.matchUpStatus) ||
    matchUp?.winningSide;

  const bracketComplete =
    relevantMatchUps.filter(matchUpComplete).length === relevantMatchUps.length;
  // if bracket is incomplete don't use expected matchUps perPlayer for calculating
  if (!bracketComplete) perPlayer = 0;

  const tallyPolicy = policyDefinition?.POLICY_TYPE_ROUND_ROBIN_TALLY;

  const completedMatchUps = matchUps.filter(matchUpComplete);
  const { participantResults, disqualified } = getParticipantResults({
    matchUps: completedMatchUps,
    matchUpFormat,
    tallyPolicy,
    perPlayer,
  });

  const groupOrder = getGroupOrder({
    matchUps: completedMatchUps,
    participantResults,
    participantsCount,
    matchUpFormat,
    disqualified,
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
