import { instanceCount, unique } from '../../../../utilities/arrays';
import { getFinishingPositions } from './getFinishingPositions';
import { determineOrder } from './determineOrder';
import { getParticipantResults } from './getParticipantResults';

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

  const order = determineOrder({
    participantResults,
    participantsCount,
    disqualified,
    tallyPolicy,
  });

  const finishingPositions = getFinishingPositions({
    matchUps: completedMatchUps,
    participantResults,
    participantsCount,
    matchUpFormat,
    disqualified,
    tallyPolicy,
  });

  if (bracketComplete && finishingPositions) {
    finishingPositions.forEach((finishingPosition) => {
      const result = participantResults[finishingPosition.participantId];
      result.finishingPosition = finishingPosition.position;
    });
  }

  // do not calculate order if bracket is not complete
  if (bracketComplete && order) {
    const rankOrders = order.map(({ rankOrder }) => rankOrder);
    const rankOrdersCount = instanceCount(rankOrders);
    order.forEach((o) => {
      const result = participantResults[o.participantId];
      const rankOrderInstances = rankOrdersCount[o.rankOrder];

      result.GEMscore = o.GEMscore;
      if (o !== undefined && o.rankOrder !== undefined) {
        // subOrder is only assigned if there are ties
        if (rankOrderInstances > 1) {
          const subOrder = subOrderMap && subOrderMap[o.participantId];
          result.ties = rankOrderInstances;
          result.subOrder = subOrder;
        }

        result.rankOrder = o.rankOrder;
        result.groupOrder = o.rankOrder + (result.subOrder || 1) - 1;
      }

      // calculate order for awarding points
      if (o !== undefined && o.pointsOrder !== undefined) {
        result.pointsOrder = o.pointsOrder;
      } else {
        result.pointsOrder = undefined;
      }
    });
  }

  return { participantResults };
}
