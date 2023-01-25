import { matchUpIsComplete } from '../../governors/queryGovernor/matchUpIsComplete';
import { getParticipantResults } from './getParticipantResults';
import { unique } from '../../../utilities/arrays';
import { getGroupOrder } from './getGroupOrder';

import { POLICY_TYPE_ROUND_ROBIN_TALLY } from '../../../constants/policyConstants';
import { BYE } from '../../../constants/matchUpStatusConstants';
import { TEAM } from '../../../constants/matchUpTypes';
import {
  INVALID_VALUES,
  MISSING_MATCHUPS,
} from '../../../constants/errorConditionConstants';

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
    relevantMatchUps.filter((matchUp) => matchUpIsComplete({ matchUp }))
      .length === relevantMatchUps.length;
  // if bracket is incomplete don't use expected matchUps perPlayer for calculating
  if (!bracketComplete) perPlayer = 0;

  const tallyPolicy =
    policyDefinitions && policyDefinitions[POLICY_TYPE_ROUND_ROBIN_TALLY];

  const consideredMatchUps = matchUps.filter(
    (matchUp) => matchUpIsComplete({ matchUp }) || matchUp.matchUpType === TEAM
  );
  const { participantResults } = getParticipantResults({
    matchUps: consideredMatchUps,
    matchUpFormat,
    tallyPolicy,
    perPlayer,
  });

  const groupOrder = getGroupOrder({
    matchUps: consideredMatchUps,
    participantResults,
    participantsCount,
    matchUpFormat,
    tallyPolicy,
    subOrderMap,
  });

  // do not add groupOrder if bracket is not complete
  if (bracketComplete && groupOrder) {
    groupOrder.forEach((finishingPosition) => {
      const { participantId, groupOrder, rankOrder, subOrder, ties, GEMscore } =
        finishingPosition;
      const participantResult = participantResults[participantId];
      Object.assign(participantResult, {
        groupOrder,
        rankOrder,
        GEMscore,
        subOrder,
        ties,
      });
    });
  } else {
    const provionalOrder = getGroupOrder({
      requireCompletion: false,
      participantResults,
      participantsCount,
      matchUpFormat,
      tallyPolicy,
      subOrderMap,
      matchUps,
    });

    if (provionalOrder) {
      provionalOrder.forEach((finishingPosition) => {
        const { participantId, groupOrder, GEMscore } = finishingPosition;
        const participantResult = participantResults[participantId];
        Object.assign(participantResult, {
          provisionalOrder: groupOrder,
          GEMscore,
        });
      });
    }
  }

  return { participantResults, bracketComplete };
}
