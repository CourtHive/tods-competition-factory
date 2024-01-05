import { checkMatchUpIsComplete } from '../../matchUp/checkMatchUpIsComplete';
import { getDevContext } from '../../../global/state/globalState';
import { validMatchUps } from '../../../validators/validMatchUp';
import { getParticipantResults } from './getParticipantResults';
import { unique } from '../../../utilities/arrays';
import { getTallyReport } from './getTallyReport';
import { getGroupOrder } from './getGroupOrder';

import { POLICY_TYPE_ROUND_ROBIN_TALLY } from '../../../constants/policyConstants';
import { ResultType } from '../../../global/functions/decorateResult';
import { BYE } from '../../../constants/matchUpStatusConstants';
import { PolicyDefinitions } from '../../../types/factoryTypes';
import { TEAM } from '../../../constants/matchUpTypes';
import {
  INVALID_VALUES,
  MISSING_MATCHUPS,
} from '../../../constants/errorConditionConstants';

type TallyParticipantResultsArgs = {
  policyDefinitions?: PolicyDefinitions;
  generateReport?: boolean;
  matchUpFormat?: string;
  perPlayer?: number;
  subOrderMap?: any;
  matchUps: any[];
};

type TallyResultType = {
  completedTieMatchUps?: boolean;
  bracketComplete?: boolean;
  participantResults?: any;
  readableReport?: string;
  report?: string[];
  order?: any[];
};

export function tallyParticipantResults({
  policyDefinitions,
  generateReport,
  matchUpFormat,
  matchUps = [],
  subOrderMap,
  perPlayer,
}: TallyParticipantResultsArgs): TallyResultType & ResultType {
  if (!validMatchUps(matchUps)) return { error: MISSING_MATCHUPS };

  const structureIds = matchUps.reduce(
    (structureIds, { structureId }) =>
      structureIds.includes(structureId)
        ? structureIds
        : structureIds.concat(structureId),
    []
  );
  if (structureIds.length !== 1)
    return { error: INVALID_VALUES, info: 'Maximum one structureId' };

  const relevantMatchUps = matchUps.filter(
    (matchUp) => matchUp && matchUp.matchUpStatus !== BYE
  );

  const participantsCount =
    relevantMatchUps.length &&
    unique(relevantMatchUps.map(({ drawPositions }) => drawPositions).flat())
      .length;

  const bracketComplete =
    relevantMatchUps.filter((matchUp) => checkMatchUpIsComplete({ matchUp }))
      .length === relevantMatchUps.length;
  // if bracket is incomplete don't use expected matchUps perPlayer for calculating
  if (!bracketComplete) perPlayer = 0;

  const completedTieMatchUps = matchUps.every(
    ({ matchUpType, tieMatchUps }) =>
      matchUpType === TEAM &&
      tieMatchUps?.every((matchUp) => checkMatchUpIsComplete({ matchUp }))
  );

  const tallyPolicy = policyDefinitions?.[POLICY_TYPE_ROUND_ROBIN_TALLY];

  const consideredMatchUps = matchUps.filter(
    (matchUp) =>
      checkMatchUpIsComplete({ matchUp }) || matchUp.matchUpType === TEAM
  );
  const { participantResults } = getParticipantResults({
    matchUps: consideredMatchUps,
    matchUpFormat,
    tallyPolicy,
    perPlayer,
  });

  let report, order;

  const { groupOrder, report: groupOrderReport } = getGroupOrder({
    matchUps: consideredMatchUps,
    participantResults,
    participantsCount,
    matchUpFormat,
    tallyPolicy,
    subOrderMap,
  });

  // do not add groupOrder if bracket is not complete
  if (bracketComplete && groupOrder) {
    report = groupOrderReport;
    order = groupOrder;

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
    const { groupOrder: provisionalOrder, report: provisionalOrderReport } =
      getGroupOrder({
        requireCompletion: false,
        participantResults,
        participantsCount,
        matchUpFormat,
        tallyPolicy,
        subOrderMap,
        matchUps,
      });

    report = provisionalOrderReport;
    order = provisionalOrder;

    if (provisionalOrder) {
      provisionalOrder.forEach((finishingPosition) => {
        const { participantId, groupOrder, GEMscore } = finishingPosition;
        const participantResult = participantResults[participantId];
        Object.assign(participantResult, {
          provisionalOrder: groupOrder,
          GEMscore,
        });
      });
    }
  }

  const result = {
    completedTieMatchUps,
    readableReport: '',
    participantResults,
    bracketComplete,
    order: [],
    report,
  };

  if (bracketComplete || completedTieMatchUps) {
    result.order = order;
  }

  if (generateReport || getDevContext({ tally: true })) {
    const readable = getTallyReport({ matchUps, report, order });
    if (getDevContext({ tally: true })) console.log(readable);
    result.readableReport = readable;
  }

  return result;
}
