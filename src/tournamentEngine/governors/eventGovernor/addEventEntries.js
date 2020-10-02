import { findEvent } from '../../getters/eventGetter';
import { SUCCESS } from '../../../constants/resultConstants';
import { MAIN } from '../../../constants/drawDefinitionConstants';
import { DIRECT_ACCEPTANCE } from '../../../constants/participantConstants';
import { DOUBLES, SINGLES } from '../../../constants/matchUpTypes';
import { INDIVIDUAL, PAIR, TEAM } from '../../../constants/participantTypes';

export function addEventEntries(props) {
  const {
    tournamentRecord,
    eventId,
    participantIds = [],
    entryStatus = DIRECT_ACCEPTANCE,
    entryStage = MAIN,
  } = props;

  if (!eventId) return { error: 'Missing eventId' };
  if (!participantIds || !participantIds.length) {
    return { error: 'Missing participants' };
  }

  const { event } = findEvent({ tournamentRecord, eventId });
  if (!event || !event.eventId) return { error: 'Event not found' };

  const typedParticipantIds = tournamentRecord?.participants
    ?.filter(participant => {
      if (
        event.eventType === SINGLES &&
        participant.participantType === INDIVIDUAL
      ) {
        return true;
      }
      if (event.eventType === DOUBLES && participant.participantType === PAIR) {
        return true;
      }
      if (event.eventType === TEAM && participant.participantType === TEAM) {
        return true;
      }
    })
    .map(participant => participant.participantId);

  const validParticipantIds = participantIds.filter(participantId =>
    typedParticipantIds.includes(participantId)
  );

  if (!event.entries) event.entries = [];
  const existingIds = event.entries.map(
    e => e.participantId || (e.participant && e.participant.participantId)
  );
  validParticipantIds.forEach(participantId => {
    if (!existingIds.includes(participantId)) {
      event.entries.push({
        participantId,
        entryStatus,
        entryStage,
      });
    }
  });

  return SUCCESS;
}
