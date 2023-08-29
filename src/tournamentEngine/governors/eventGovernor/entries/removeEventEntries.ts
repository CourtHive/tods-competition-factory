import { getTournamentParticipants } from '../../../getters/participants/getTournamentParticipants';
import { refreshEntryPositions } from '../../../../global/functions/producers/refreshEntryPositions';
import { decorateResult } from '../../../../global/functions/decorateResult';
import { getFlightProfile } from '../../../getters/getFlightProfile';

import { SUCCESS } from '../../../../constants/resultConstants';
import {
  MISSING_EVENT,
  MISSING_PARTICIPANT_IDS,
  EXISTING_PARTICIPANT_DRAW_POSITION_ASSIGNMENT,
} from '../../../../constants/errorConditionConstants';
import { Event, Tournament } from '../../../../types/tournamentFromSchema';
import { HydratedParticipant } from '../../../../types/hydrated';

type RemoveEventEntriesArgs = {
  tournamentParticipants?: HydratedParticipant[];
  tournamentRecord?: Tournament;
  autoEntryPositions?: boolean;
  participantIds: string[];
  event: Event;
};
export function removeEventEntries({
  autoEntryPositions = true,
  tournamentParticipants,
  tournamentRecord,
  participantIds,
  event,
}: RemoveEventEntriesArgs) {
  const stack = 'removeEventEntries';
  if (!event?.eventId) return { error: MISSING_EVENT };
  if (!Array.isArray(participantIds))
    return decorateResult({
      result: { error: MISSING_PARTICIPANT_IDS },
      stack,
    });

  participantIds = participantIds?.filter(Boolean);
  if (!participantIds?.length)
    return decorateResult({
      result: { error: MISSING_PARTICIPANT_IDS },
      stack,
    });

  const { eventId } = event;

  if (!tournamentParticipants) {
    // cannot use getParticipants() because event objects don't have drawIds array
    tournamentParticipants = getTournamentParticipants({
      participantFilters: { participantIds },
      tournamentRecord,
      withEvents: true,
      withDraws: true,
    }).tournamentParticipants;
  }

  const enteredParticipantIds = tournamentParticipants?.every((participant) => {
    const eventObject = participant.events.find(
      (event) => event.eventId === eventId
    );
    const drawIds = eventObject?.drawIds || [];
    return participant.draws.filter(
      (drawInfo) =>
        drawIds.includes(drawInfo.drawId) && drawInfo.positionAssignments
    ).length;
  });

  if (enteredParticipantIds) {
    return decorateResult({
      result: { error: EXISTING_PARTICIPANT_DRAW_POSITION_ASSIGNMENT },
      stack,
    });
  }

  const participantIdsRemoved: string[] = [];

  event.entries = (event.entries || []).filter((entry) => {
    const keepEntry = !participantIds.includes(entry?.participantId);
    if (!keepEntry) participantIdsRemoved.push(entry.participantId);
    return keepEntry;
  });

  if (autoEntryPositions) {
    event.entries = refreshEntryPositions({
      entries: event.entries,
    });
  }

  // also remove entry from all flights and drawDefinitions
  const { flightProfile } = getFlightProfile({ event });
  flightProfile?.flights?.forEach((flight) => {
    flight.drawEntries = (flight.drawEntries || []).filter(
      (entry) => !participantIds.includes(entry.participantId)
    );
  });

  event.drawDefinitions?.forEach((drawDefinition) => {
    drawDefinition.entries = (drawDefinition.entries || []).filter(
      (entry) => !participantIds.includes(entry.participantId)
    );
  });

  return { ...SUCCESS, participantIdsRemoved };
}
