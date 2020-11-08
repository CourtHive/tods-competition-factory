import { addTimeItem } from './timeItems';

import { findMatchUp } from '../../getters/getMatchUps';
import { getCheckedInParticipantIds } from '../../getters/matchUpTimeItems';

import { CHECK_IN, CHECK_OUT } from '../../../constants/timeItemConstants';
import { getMatchUpParticipantIds } from '../../accessors/participantAccessor';
import {
  MISSING_MATCHUP,
  MISSING_MATCHUP_ID,
  MISSING_PARTICIPANT_ID,
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
    const { checkedInParticipantIds } = getCheckedInParticipantIds({ matchUp });
    if (checkedInParticipantIds.includes(participantId)) {
      return { error: 'participant already checked in' };
    }
  }

  const timeItem = {
    itemSubject: CHECK_IN,
    itemValue: participantId,
  };

  return addTimeItem({ drawDefinition, matchUpId, timeItem });
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
    const { checkedInParticipantIds } = getCheckedInParticipantIds({ matchUp });
    if (!checkedInParticipantIds.includes(participantId)) {
      return { error: 'participant not checked in' };
    }

    const {
      sideParticipantIds,
      nestedIndividualParticipantIds,
    } = getMatchUpParticipantIds({ matchUp });
    const sideIndex = sideParticipantIds.indexOf(participantId);
    if ([0, 1].includes(sideIndex)) {
      (nestedIndividualParticipantIds[sideIndex] || []).forEach(
        participantId => {
          const timeItem = {
            itemSubject: CHECK_OUT,
            itemValue: participantId,
          };
          addTimeItem({ drawDefinition, matchUpId, timeItem });
        }
      );
    }
  }

  const timeItem = {
    itemSubject: CHECK_OUT,
    itemValue: participantId,
  };

  return addTimeItem({ drawDefinition, matchUpId, timeItem });
}
