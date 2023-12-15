import { scoreHasValue } from '../../../matchUpEngine/governors/queryGovernor/scoreHasValue';
import { getMatchUpParticipantIds } from '../../queries/matchUp/getMatchUpParticipantIds';
import { getCheckedInParticipantIds } from '../../queries/matchUp/getCheckedInParticipantIds';
import { findDrawMatchUp } from '../../../drawEngine/getters/getMatchUps/findDrawMatchUp';
import { addMatchUpTimeItem } from './matchUpTimeItems';

import { CHECK_IN, CHECK_OUT } from '../../../constants/timeItemConstants';
import { HydratedMatchUp } from '../../../types/hydrated';
import {
  INVALID_ACTION,
  INVALID_PARTICIPANT_ID,
  MATCHUP_NOT_FOUND,
  MISSING_MATCHUP,
  MISSING_MATCHUP_ID,
  MISSING_PARTICIPANT_ID,
  PARTICIPANT_NOT_CHECKED_IN,
} from '../../../constants/errorConditionConstants';
import {
  activeMatchUpStatuses,
  completedMatchUpStatuses,
} from '../../../constants/matchUpStatusConstants';
import {
  DrawDefinition,
  Event,
  Participant,
  Tournament,
} from '../../../types/tournamentTypes';
import { SUCCESS } from '../../../constants/resultConstants';

/*
  function is only able to check whether participant is alredy checked in 
  if given full context, which means tournamentParticipants loaded in drawEngine
  Otherwise a participant may be checked in multiple times
*/
type CheckInOutParticipantArgs = {
  tournamentParticipants?: Participant[];
  tournamentRecord?: Tournament;
  drawDefinition: DrawDefinition;
  matchUp?: HydratedMatchUp;
  participantId: string;
  matchUpId: string;
  event?: Event;
};
export function checkInParticipant({
  tournamentParticipants,
  tournamentRecord,
  drawDefinition,
  participantId,
  matchUpId,
  matchUp,
  event,
}: CheckInOutParticipantArgs) {
  if (!participantId) return { error: MISSING_PARTICIPANT_ID };
  if (!matchUpId) return { error: MISSING_MATCHUP };

  tournamentParticipants =
    tournamentParticipants ?? tournamentRecord?.participants;

  if (tournamentParticipants?.length) {
    if (!matchUp && drawDefinition) {
      const result = findDrawMatchUp({
        tournamentParticipants,
        inContext: true,
        drawDefinition,
        matchUpId,
        event,
      });
      matchUp = result?.matchUp;
    }
    if (!matchUp) return { error: MATCHUP_NOT_FOUND };

    const result = getCheckedInParticipantIds({
      matchUp,
    });
    if (result?.error) return result;

    const { checkedInParticipantIds, allRelevantParticipantIds } = result;

    if (checkedInParticipantIds?.includes(participantId)) return { ...SUCCESS };

    if (!allRelevantParticipantIds?.includes(participantId))
      return { error: INVALID_PARTICIPANT_ID };
  }

  const timeItem = {
    itemValue: participantId,
    itemType: CHECK_IN,
  };

  return addMatchUpTimeItem({
    tournamentRecord,
    drawDefinition,
    matchUpId,
    timeItem,
  });
}

export function checkOutParticipant({
  tournamentParticipants,
  tournamentRecord,
  drawDefinition,
  participantId,
  matchUpId,
  matchUp,
  event,
}: CheckInOutParticipantArgs) {
  if (!participantId) return { error: MISSING_PARTICIPANT_ID };
  if (!matchUpId && !matchUp) return { error: MISSING_MATCHUP_ID };

  tournamentParticipants =
    tournamentParticipants ?? tournamentRecord?.participants;

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
