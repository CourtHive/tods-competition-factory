import { findEvent } from '../../getters/eventGetter';
import { SUCCESS } from '../../../constants/resultConstants';

export function deleteEventEntries({tournamentRecord, eventId, participantIds}) {
  if (!eventId) return { error: 'Missing eventId' };
  if (!participantIds || !participantIds.length) return { error: 'Missing participantIds' }; 

  let { event } = findEvent({tournamentRecord, eventId});
  if (!event || !event.eventId) return { error: 'Event not found' };
  if (!event.entries) event.entries = [];

  // TODO: filter participantIds to delete by those that are active in events

  event.entries = event.entries.filter(entry => {
    const entryId = entry.participantId || (entry.participant && entry.participant.participantId);
    return participantIds.includes(entryId) ? false : true;
  })

  return SUCCESS;
}
