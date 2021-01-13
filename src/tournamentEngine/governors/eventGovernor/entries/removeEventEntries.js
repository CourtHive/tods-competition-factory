import {
  MISSING_EVENT,
  EVENT_NOT_FOUND,
  MISSING_PARTICIPANT_IDS,
} from '../../../../constants/errorConditionConstants';
import { SUCCESS } from '../../../../constants/resultConstants';

export function removeEventEntries({ participantIds, drawDefinition, event }) {
  if (!event) return { error: MISSING_EVENT };
  if (!participantIds || !participantIds.length)
    return { error: MISSING_PARTICIPANT_IDS };

  if (!event || !event.eventId) return { error: EVENT_NOT_FOUND };
  if (!event.entries) event.entries = [];

  // TODO: filter participantIds / don't delete those that are active in drawDefinitions
  event.entries = event.entries.filter((entry) => {
    const entryId =
      entry.participantId ||
      (entry.participant && entry.participant.participantId);
    return participantIds.includes(entryId) ? false : true;
  });

  // TODO: this needs to be rationalized once we get to multiple draws in a single event
  if (drawDefinition) {
    drawDefinition.entries = drawDefinition.entries.filter((entry) => {
      const entryId =
        entry.participantId ||
        (entry.participant && entry.participant.participantId);
      return participantIds.includes(entryId) ? false : true;
    });
  }

  return SUCCESS;
}
