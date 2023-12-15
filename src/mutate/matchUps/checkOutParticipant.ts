import { getCheckedInParticipantIds } from '../../query/matchUp/getCheckedInParticipantIds';
import { getMatchUpParticipantIds } from '../../query/matchUp/getMatchUpParticipantIds';
import { findMatchUp } from '../../tournamentEngine/getters/matchUpsGetter/findMatchUp';
import { checkScoreHasValue } from '../../query/matchUp/checkScoreHasValue';
import { addMatchUpTimeItem } from './matchUpTimeItems';

import { CheckInOutParticipantArgs } from '../../types/factoryTypes';
import { CHECK_OUT } from '../../constants/timeItemConstants';
import {
  INVALID_ACTION,
  INVALID_PARTICIPANT_ID,
  MISSING_DRAW_DEFINITION,
  MISSING_MATCHUP_ID,
  MISSING_PARTICIPANT_ID,
  MISSING_TOURNAMENT_RECORD,
  PARTICIPANT_NOT_CHECKED_IN,
} from '../../constants/errorConditionConstants';
import {
  activeMatchUpStatuses,
  completedMatchUpStatuses,
} from '../../constants/matchUpStatusConstants';

export function checkOutParticipant({
  tournamentRecord,
  drawDefinition,
  participantId,
  matchUpId,
}: CheckInOutParticipantArgs) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!drawDefinition) return { error: MISSING_DRAW_DEFINITION };
  if (!participantId) return { error: MISSING_PARTICIPANT_ID };
  if (!matchUpId) return { error: MISSING_MATCHUP_ID };

  const matchUpResult = findMatchUp({
    tournamentRecord,
    inContext: true,
    drawDefinition,
    matchUpId,
  });
  if (matchUpResult.error) return matchUpResult;

  const { matchUpStatus, score } = matchUpResult?.matchUp ?? {};

  if (
    (matchUpStatus && activeMatchUpStatuses.includes(matchUpStatus)) ||
    (matchUpStatus && completedMatchUpStatuses.includes(matchUpStatus)) ||
    checkScoreHasValue({ score })
  ) {
    return { error: INVALID_ACTION };
  }

  const getCheckedResult =
    matchUpResult.matchUp &&
    getCheckedInParticipantIds({
      matchUp: matchUpResult.matchUp,
    });
  if (getCheckedResult?.error) return getCheckedResult;
  const { checkedInParticipantIds, allRelevantParticipantIds } =
    getCheckedResult ?? {};

  if (!allRelevantParticipantIds?.includes(participantId))
    return { error: INVALID_PARTICIPANT_ID };
  if (!checkedInParticipantIds?.includes(participantId)) {
    return { error: PARTICIPANT_NOT_CHECKED_IN };
  }

  const getIdsResult =
    matchUpResult.matchUp &&
    getMatchUpParticipantIds({ matchUp: matchUpResult.matchUp });
  if (getIdsResult?.error) return getIdsResult;

  const { sideParticipantIds, nestedIndividualParticipantIds } =
    getIdsResult ?? {};

  const sideIndex = sideParticipantIds?.indexOf(participantId);
  if (sideIndex !== undefined && [0, 1].includes(sideIndex)) {
    (nestedIndividualParticipantIds?.[sideIndex] ?? []).forEach(
      (participantId) => {
        const timeItem = {
          itemType: CHECK_OUT,
          itemValue: participantId,
        };
        addMatchUpTimeItem({ drawDefinition, matchUpId, timeItem });
      }
    );
  }

  const timeItem = {
    itemValue: participantId,
    itemType: CHECK_OUT,
  };

  return addMatchUpTimeItem({
    tournamentRecord,
    drawDefinition,
    matchUpId,
    timeItem,
  });
}
