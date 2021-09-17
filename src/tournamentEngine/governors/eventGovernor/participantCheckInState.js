import { findEvent } from '../../getters/eventGetter';
import {
  checkInParticipant as drawEngineCheckInParticipant,
  checkOutParticipant as drawEngineCheckOutParticipant,
} from '../../../drawEngine/governors/matchUpGovernor/checkInStatus';

import { SUCCESS } from '../../../constants/resultConstants';
import {
  EVENT_NOT_FOUND,
  PARTICIPANT_ALREADY_CHECKED_IN,
} from '../../../constants/errorConditionConstants';

export function checkInParticipant({
  tournamentRecord,
  participantId,
  matchUpId,
  matchUp,
  drawId,
}) {
  if (matchUp && !drawId) {
    ({ drawId } = matchUp);
  }
  if (matchUp && !matchUpId) {
    ({ matchUpId } = matchUp);
  }

  const { event, drawDefinition } = findEvent({ tournamentRecord, drawId });

  if (event) {
    const tournamentParticipants = tournamentRecord.participants;
    const result = drawEngineCheckInParticipant({
      tournamentParticipants,
      drawDefinition,
      participantId,
      matchUpId,
    });
    // Don't consider it an error if participant is already checked in
    if (result.error && result.error !== PARTICIPANT_ALREADY_CHECKED_IN)
      return result;
  } else {
    return { error: EVENT_NOT_FOUND };
  }

  return SUCCESS;
}

export function checkOutParticipant({
  tournamentRecord,
  drawId,
  matchUpId,
  participantId,
  matchUp,
}) {
  if (matchUp && !drawId) {
    ({ drawId } = matchUp);
  }
  if (matchUp && !matchUpId) {
    ({ matchUpId } = matchUp);
  }

  const { event, drawDefinition } = findEvent({ tournamentRecord, drawId });

  if (event) {
    const tournamentParticipants = tournamentRecord.participants;
    const result = drawEngineCheckOutParticipant({
      drawDefinition,
      tournamentParticipants,
      matchUpId,
      participantId,
    });
    if (result.error) return result;
  } else {
    return { error: EVENT_NOT_FOUND };
  }

  return SUCCESS;
}
