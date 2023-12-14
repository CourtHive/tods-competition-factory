import { findEvent } from '../../getters/findEvent';
import {
  checkInParticipant as drawEngineCheckInParticipant,
  checkOutParticipant as drawEngineCheckOutParticipant,
} from '../../../drawEngine/governors/matchUpGovernor/checkInStatus';

import { Tournament } from '../../../types/tournamentTypes';
import { SUCCESS } from '../../../constants/resultConstants';
import { HydratedMatchUp } from '../../../types/hydrated';
import {
  EVENT_NOT_FOUND,
  PARTICIPANT_ALREADY_CHECKED_IN,
} from '../../../constants/errorConditionConstants';

type CheckInOutParticipantArgs = {
  tournamentRecord: Tournament;
  matchUp?: HydratedMatchUp;
  participantId: string;
  matchUpId: string;
  drawId?: string;
};

export function checkInParticipant({
  tournamentRecord,
  participantId,
  matchUpId,
  matchUp,
  drawId,
}: CheckInOutParticipantArgs) {
  if (matchUp && !drawId) {
    ({ drawId } = matchUp);
  }
  if (matchUp && !matchUpId) {
    ({ matchUpId } = matchUp);
  }

  const { drawDefinition } = findEvent({ tournamentRecord, drawId });

  if (drawDefinition) {
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

  return { ...SUCCESS };
}

export function checkOutParticipant({
  tournamentRecord,
  participantId,
  matchUpId,
  matchUp,
  drawId,
}: CheckInOutParticipantArgs) {
  if (matchUp && !drawId) {
    ({ drawId } = matchUp);
  }
  if (matchUp && !matchUpId) {
    ({ matchUpId } = matchUp);
  }

  const { drawDefinition } = findEvent({ tournamentRecord, drawId });

  if (drawDefinition) {
    const tournamentParticipants = tournamentRecord.participants;
    const result = drawEngineCheckOutParticipant({
      tournamentParticipants,
      drawDefinition,
      participantId,
      matchUpId,
    });
    if (result.error) return result;
  } else {
    return { error: EVENT_NOT_FOUND };
  }

  return { ...SUCCESS };
}
