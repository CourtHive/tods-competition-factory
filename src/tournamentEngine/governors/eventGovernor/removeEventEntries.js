import { SUCCESS } from '../../../constants/resultConstants';

export function removeEventEntries({ participantIds, event }) {
  if (!event) return { error: 'Missing event' };
  if (!participantIds || !participantIds.length)
    return { error: 'Missing participantIds' };

  if (!event || !event.eventId) return { error: 'Event not found' };
  if (!event.entries) event.entries = [];

  // TODO: filter participantIds / don't delete those that are active in drawDefinitions

  event.entries = event.entries.filter(entry => {
    const entryId =
      entry.participantId ||
      (entry.participant && entry.participant.participantId);
    return participantIds.includes(entryId) ? false : true;
  });

  return SUCCESS;
}
