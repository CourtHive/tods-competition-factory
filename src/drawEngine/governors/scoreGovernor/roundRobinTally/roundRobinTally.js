import { getParticipantResults } from './getParticipantResults';
import { matchUpIsComplete } from '../matchUpIsComplete';
import { unique } from '../../../../utilities/arrays';
import { getGroupOrder } from './getGroupOrder';

import { POLICY_TYPE_ROUND_ROBIN_TALLY } from '../../../../constants/policyConstants';
import { BYE } from '../../../../constants/matchUpStatusConstants';
import {
  INVALID_VALUES,
  MISSING_MATCHUPS,
} from '../../../../constants/errorConditionConstants';

export function tallyParticipantResults({
  policyDefinitions,
  matchUpFormat,
  matchUps = [],
  subOrderMap,
  perPlayer,
}) {
  if (!Array.isArray(matchUps)) return { error: MISSING_MATCHUPS };

  const structureIds = matchUps.reduce(
    (structureIds, { structureId }) =>
      structureIds.includes(structureId)
        ? structureIds
        : structureIds.concat(structureId),
    []
  );
  if (structureIds.length !== 1) return { error: INVALID_VALUES };

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
  const { participantResults } = getParticipantResults({
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
