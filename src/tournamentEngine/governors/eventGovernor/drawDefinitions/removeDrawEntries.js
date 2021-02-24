import { getFlightProfile } from '../../../getters/getFlightProfile';

import {
  MISSING_EVENT,
  EVENT_NOT_FOUND,
  MISSING_PARTICIPANT_IDS,
  MISSING_DRAW_ID,
} from '../../../../constants/errorConditionConstants';
import { SUCCESS } from '../../../../constants/resultConstants';

export function removeDrawEntries({
  participantIds,
  drawDefinition,
  drawId,
  event,
}) {
  if (!event) return { error: MISSING_EVENT };
  if (!drawId) return { error: MISSING_DRAW_ID };
  if (!participantIds || !participantIds.length)
    return { error: MISSING_PARTICIPANT_IDS };

  if (!event || !event.eventId) return { error: EVENT_NOT_FOUND };
  if (!event.entries) event.entries = [];

  const filterEntry = (entry) => {
    const entryId = entry.participantId || entry.participant?.participantId;
    return participantIds.includes(entryId) ? false : true;
  };

  const { flightProfile } = getFlightProfile({ event });
  const flight = flightProfile?.flights.find(
    (flight) => flight.drawId === drawId
  );
  if (flight?.drawEntries) {
    flight.drawEntries = flight.drawEntries.filter(filterEntry);
  }

  if (drawDefinition?.entries) {
    drawDefinition.entries = drawDefinition.entries.filter(filterEntry);
  }

  return SUCCESS;
}
