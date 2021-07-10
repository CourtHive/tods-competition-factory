import { getMatchUpParticipantIds } from '../../accessors/participantAccessor';
import { getCheckedInParticipantIds } from '../../getters/matchUpTimeItems';
import { findMatchUp } from '../../getters/getMatchUps/findMatchUp';
import { addMatchUpTimeItem } from './timeItems';

import { CHECK_IN, CHECK_OUT } from '../../../constants/timeItemConstants';
import {
  INVALID_PARTICIPANT_ID,
  MATCHUP_NOT_FOUND,
  MISSING_MATCHUP,
  MISSING_MATCHUP_ID,
  MISSING_PARTICIPANT_ID,
  PARTICIPANT_ALREADY_CHECKED_IN,
  PARTICIPANT_NOT_CHECKED_IN,
} from '../../../constants/errorConditionConstants';

/*
  function is only able to check whether participant is alredy checked in 
  if given full context, which means tournamentParticipants loaded in drawEngine
  Otherwise a participant may be checked in multiple times
*/
export function checkInParticipant({
  drawDefinition,
  tournamentParticipants,
  matchUpId,
  participantId,
}) {
  if (!participantId) return { error: MISSING_PARTICIPANT_ID };
  if (!matchUpId) return { error: MISSING_MATCHUP };

  if (tournamentParticipants && tournamentParticipants.length) {
    const { matchUp } = findMatchUp({
      drawDefinition,
      tournamentParticipants,
      matchUpId,
      inContext: true,
    });
    if (!matchUp) return { error: MATCHUP_NOT_FOUND };
    const { error, checkedInParticipantIds, allRelevantParticipantIds } =
      getCheckedInParticipantIds({
        matchUp,
      });

    if (!allRelevantParticipantIds.includes(participantId))
      return { error: INVALID_PARTICIPANT_ID };
    if (error) return { error };
    if (checkedInParticipantIds.includes(participantId)) {
      return { error: PARTICIPANT_ALREADY_CHECKED_IN };
    }
  }

  const timeItem = {
    itemType: CHECK_IN,
    itemValue: participantId,
  };

  return addMatchUpTimeItem({ drawDefinition, matchUpId, timeItem });
}

export function checkOutParticipant({
  drawDefinition,
  tournamentParticipants,
  matchUpId,
  participantId,
}) {
  if (!participantId) return { error: MISSING_PARTICIPANT_ID };
  if (!matchUpId) return { error: MISSING_MATCHUP_ID };

  // TODO: disallow checkout of participants if a matchUp is in progress

  if (tournamentParticipants && tournamentParticipants.length) {
    const { matchUp } = findMatchUp({
      drawDefinition,
      tournamentParticipants,
      matchUpId,
      inContext: true,
    });
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

  return addMatchUpTimeItem({ drawDefinition, matchUpId, timeItem });
}
