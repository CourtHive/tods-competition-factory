import { getTournamentParticipants } from '../../../getters/participants/getTournamentParticipants';
import { refreshEntryPositions } from '../../../../common/producers/refreshEntryPositions';
import { getFlightProfile } from '../../../getters/getFlightProfile';

import { SUCCESS } from '../../../../constants/resultConstants';
import {
  MISSING_EVENT,
  EVENT_NOT_FOUND,
  MISSING_PARTICIPANT_IDS,
  EXISTING_PARTICIPANT_DRAW_POSITION_ASSIGNMENT,
} from '../../../../constants/errorConditionConstants';

export function removeEventEntries({
  tournamentRecord,
  participantIds,
  event,
  autoEntryPositions = true,
}) {
  if (!event) return { error: MISSING_EVENT };
  if (!participantIds || !participantIds.length)
    return { error: MISSING_PARTICIPANT_IDS };

  if (!event || !event.eventId) return { error: EVENT_NOT_FOUND };
  if (!event.entries) event.entries = [];
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

  event.entries = event.entries.filter((entry) => {
    const entryId =
      entry.participantId ||
      (entry.participant && entry.participant.participantId);
    return participantIds.includes(entryId) ? false : true;
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

  return SUCCESS;
}
