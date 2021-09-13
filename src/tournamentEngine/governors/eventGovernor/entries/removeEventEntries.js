import { getTournamentParticipants } from '../../../getters/participants/getTournamentParticipants';
import { refreshEntryPositions } from '../../../../common/producers/refreshEntryPositions';
import { getFlightProfile } from '../../../getters/getFlightProfile';

import { SUCCESS } from '../../../../constants/resultConstants';
import {
  MISSING_EVENT,
  MISSING_PARTICIPANT_IDS,
  EXISTING_PARTICIPANT_DRAW_POSITION_ASSIGNMENT,
} from '../../../../constants/errorConditionConstants';

export function removeEventEntries({
  autoEntryPositions = true,
  tournamentRecord,
  participantIds,
  event,
}) {
  if (!event?.eventId) return { error: MISSING_EVENT };
  if (!Array.isArray(participantIds)) return { error: MISSING_PARTICIPANT_IDS };

  participantIds = participantIds?.filter(Boolean);
  if (!participantIds?.length) return { error: MISSING_PARTICIPANT_IDS };

  const { eventId } = event;

  const { tournamentParticipants } = getTournamentParticipants({
    participantFilters: { participantIds },
    withStatistics: true,
    tournamentRecord,
  });

  const enteredParticipantIds = tournamentParticipants?.every((participant) => {
    const eventObject = participant.events.find(
      (event) => event.eventId === eventId
    );
    const enteredInDraw = eventObject?.drawIds?.length;
    return enteredInDraw;
  });

  if (enteredParticipantIds) {
    return { error: EXISTING_PARTICIPANT_DRAW_POSITION_ASSIGNMENT };
  }

  event.entries = (event.entries || []).filter((entry) =>
    participantIds.includes(entry?.participantId) ? false : true
  );

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

  return SUCCESS;
}
