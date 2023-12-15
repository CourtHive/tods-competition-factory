import { scoreHasValue } from '../../query/matchUp/scoreHasValue';
import { getMatchUpParticipantIds } from '../../query/matchUp/getMatchUpParticipantIds';
import { getCheckedInParticipantIds } from '../../query/matchUp/getCheckedInParticipantIds';
import { findDrawMatchUp } from '../../acquire/findDrawMatchUp';
import { addMatchUpTimeItem } from './matchUpTimeItems';

import { CheckInOutParticipantArgs } from '../../types/factoryTypes';
import { CHECK_OUT } from '../../constants/timeItemConstants';
import {
  INVALID_ACTION,
  INVALID_PARTICIPANT_ID,
  MATCHUP_NOT_FOUND,
  MISSING_MATCHUP_ID,
  MISSING_PARTICIPANT_ID,
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
  matchUp,
  event,
}: CheckInOutParticipantArgs) {
  if (!participantId) return { error: MISSING_PARTICIPANT_ID };
  if (!matchUpId && !matchUp) return { error: MISSING_MATCHUP_ID };

  const tournamentParticipants = tournamentRecord?.participants;

  if (!matchUp) {
    const result = findDrawMatchUp({
      tournamentParticipants,
      inContext: true,
      drawDefinition,
      matchUpId,
      event,
    });
    if (result.error) return result;
    if (!result.matchUp) return { error: MATCHUP_NOT_FOUND };
    matchUp = result.matchUp;
  }

  const { matchUpStatus, score } = matchUp;

  if (
    (matchUpStatus && activeMatchUpStatuses.includes(matchUpStatus)) ||
    (matchUpStatus && completedMatchUpStatuses.includes(matchUpStatus)) ||
    scoreHasValue({ score })
  ) {
    return { error: INVALID_ACTION };
  }

  if (tournamentParticipants?.length) {
    const { checkedInParticipantIds, allRelevantParticipantIds } =
      getCheckedInParticipantIds({ matchUp });
    if (!allRelevantParticipantIds?.includes(participantId))
      return { error: INVALID_PARTICIPANT_ID };
    if (!checkedInParticipantIds?.includes(participantId)) {
      return { error: PARTICIPANT_NOT_CHECKED_IN };
    }

    const { sideParticipantIds, nestedIndividualParticipantIds } =
      getMatchUpParticipantIds({ matchUp });
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
  }

  const timeItem = {
    itemType: CHECK_OUT,
    itemValue: participantId,
  };

  return addMatchUpTimeItem({
    tournamentRecord,
    drawDefinition,
    matchUpId,
    timeItem,
  });
}
