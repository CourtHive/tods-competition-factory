import { findEvent } from '../../../tournamentEngine/getters/findEvent';
import {
  checkInParticipant as drawEngineCheckInParticipant,
  checkOutParticipant as drawEngineCheckOutParticipant,
} from './modifyMatchUpCheckInStatus';

import { EVENT_NOT_FOUND } from '../../../constants/errorConditionConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import { Tournament } from '../../../types/tournamentTypes';
import { HydratedMatchUp } from '../../../types/hydrated';

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
    if (result.error) return result;
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
