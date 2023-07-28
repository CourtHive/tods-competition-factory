import { scoreHasValue } from '../../../matchUpEngine/governors/queryGovernor/scoreHasValue';
import { getMatchUpParticipantIds } from '../../accessors/participantAccessor';
import { getCheckedInParticipantIds } from '../../getters/matchUpTimeItems';
import { findMatchUp } from '../../getters/getMatchUps/findMatchUp';
import { addMatchUpTimeItem } from './timeItems';

import { CHECK_IN, CHECK_OUT } from '../../../constants/timeItemConstants';
import {
  INVALID_ACTION,
  INVALID_PARTICIPANT_ID,
  MATCHUP_NOT_FOUND,
  MISSING_MATCHUP,
  MISSING_MATCHUP_ID,
  MISSING_PARTICIPANT_ID,
  PARTICIPANT_ALREADY_CHECKED_IN,
  PARTICIPANT_NOT_CHECKED_IN,
} from '../../../constants/errorConditionConstants';
import {
  activeMatchUpStatuses,
  completedMatchUpStatuses,
} from '../../../constants/matchUpStatusConstants';

/*
  function is only able to check whether participant is alredy checked in 
  if given full context, which means tournamentParticipants loaded in drawEngine
  Otherwise a participant may be checked in multiple times
*/
export function checkInParticipant({
  tournamentParticipants,
  tournamentRecord,
  drawDefinition,
  participantId,
  matchUpId,
  matchUp,
  event,
}) {
  if (!participantId) return { error: MISSING_PARTICIPANT_ID };
  if (!matchUpId) return { error: MISSING_MATCHUP };

  tournamentParticipants =
    tournamentParticipants || tournamentRecord?.participants;

  if (tournamentParticipants?.length) {
    if (!matchUp) {
      const result = findMatchUp({
        tournamentParticipants,
        inContext: true,
        drawDefinition,
        matchUpId,
        event,
      });
      if (!result.matchUp) return { error: MATCHUP_NOT_FOUND };
      matchUp = result.matchUp;
    }
    const result = getCheckedInParticipantIds({
      matchUp,
    });
    if (result.error) return result;
    const { checkedInParticipantIds, allRelevantParticipantIds } = result;

    if (!allRelevantParticipantIds.includes(participantId))
      return { error: INVALID_PARTICIPANT_ID };
    if (checkedInParticipantIds.includes(participantId)) {
      return { error: PARTICIPANT_ALREADY_CHECKED_IN };
    }
  }

  const timeItem = {
    itemType: CHECK_IN,
    itemValue: participantId,
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
}) {
  if (!participantId) return { error: MISSING_PARTICIPANT_ID };
  if (!matchUpId && !matchUp) return { error: MISSING_MATCHUP_ID };

  tournamentParticipants =
    tournamentParticipants || tournamentRecord?.participants;

  if (!matchUp) {
    const result = findMatchUp({
      tournamentParticipants,
      inContext: true,
      drawDefinition,
      matchUpId,
      event,
    });
    if (result.error) return result;
    matchUp = result.matchUp;
  }

  const { matchUpStatus, score } = matchUp;

  if (
    activeMatchUpStatuses.includes(matchUpStatus) ||
    completedMatchUpStatuses.includes(matchUpStatus) ||
    scoreHasValue({ score })
  ) {
    return { error: INVALID_ACTION };
  }

  if (tournamentParticipants && tournamentParticipants.length) {
    const { checkedInParticipantIds, allRelevantParticipantIds } =
      getCheckedInParticipantIds({ matchUp });
    if (!allRelevantParticipantIds.includes(participantId))
      return { error: INVALID_PARTICIPANT_ID };
    if (!checkedInParticipantIds.includes(participantId)) {
      return { error: PARTICIPANT_NOT_CHECKED_IN };
    }

    const { sideParticipantIds, nestedIndividualParticipantIds } =
      getMatchUpParticipantIds({ matchUp });
    const sideIndex = sideParticipantIds.indexOf(participantId);
    if ([0, 1].includes(sideIndex)) {
      (nestedIndividualParticipantIds[sideIndex] || []).forEach(
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
