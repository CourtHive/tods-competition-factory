import { findEvent } from 'src/tournamentEngine/getters/eventGetter';
import { SUCCESS } from 'src/constants/resultConstants';
import { MAIN } from 'src/constants/drawDefinitionConstants';
import { DIRECT_ACCEPTANCE } from 'src/constants/participantConstants';

export function addEventEntries(props) {
  const {
    tournamentRecord,
    eventId,
    participantIds=[],
    entryType=DIRECT_ACCEPTANCE,
    entryStage=MAIN
  } = props;

  if (!eventId) return { error: 'Missing eventId' };
  if (!participantIds || !participantIds.length) return { error: 'Missing participants' }; 

  let { event } = findEvent({tournamentRecord, eventId});
  if (!event || !event.eventId) return { error: 'Event not found' };
  
  if (!event.entries) event.entries = [];
  const existingIds = event.entries.map(e => e.participantId || (e.participant && e.participant.participantId));
  participantIds.forEach(participantId => {
    if (!existingIds.includes(participantId)) {
      event.entries.push({
        participantId,
        entryType,
        entryStage
      });
    }
  });

  return SUCCESS;
}
