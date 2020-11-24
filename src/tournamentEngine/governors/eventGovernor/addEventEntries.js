import { SUCCESS } from '../../../constants/resultConstants';
import { MAIN } from '../../../constants/drawDefinitionConstants';
import {
  DIRECT_ACCEPTANCE,
  UNPAIRED,
} from '../../../constants/entryStatusConstants';
import { DOUBLES, SINGLES } from '../../../constants/matchUpTypes';
import { INDIVIDUAL, PAIR, TEAM } from '../../../constants/participantTypes';
import {
  EVENT_NOT_FOUND,
  INVALID_PARTICIPANT_IDS,
  MISSING_EVENT,
  MISSING_PARTICIPANT_IDS,
} from '../../../constants/errorConditionConstants';
import { removeEventEntries } from './removeEventEntries';

export function addEventEntries(props) {
  const {
    tournamentRecord,
    event,

    participantIds = [],
    entryStatus = DIRECT_ACCEPTANCE,
    entryStage = MAIN,
  } = props;

  if (!event) return { error: MISSING_EVENT };
  if (!participantIds || !participantIds.length) {
    return { error: MISSING_PARTICIPANT_IDS };
  }

  if (!event || !event.eventId) return { error: EVENT_NOT_FOUND };

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
      if (
        event.eventType === DOUBLES &&
        participant.participantType === INDIVIDUAL &&
        entryStatus === UNPAIRED
      ) {
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

  // now remove any unpaired participantIds which exist as part of added paired participants
  if (event.eventType === DOUBLES) {
    const enteredParticipantIds = event.entries.map(
      entry => entry.participantId
    );
    const unpairedIndividualParticipantIds = event.entries
      .filter(entry => entry.entryStatus === UNPAIRED)
      .map(entry => entry.participantId);
    const tournamentParticipants = tournamentRecord.participants || [];
    const pairedIndividualParticipantIds = tournamentParticipants
      .filter(
        participant =>
          enteredParticipantIds.includes(participant.participantId) &&
          participant.participantType === PAIR
      )
      .map(participant => participant.individualParticipantIds)
      .flat(Infinity);
    const unpairedParticipantIdsToRemove = unpairedIndividualParticipantIds.filter(
      participantId => pairedIndividualParticipantIds.includes(participantId)
    );
    console.log({
      unpairedIndividualParticipantIds,
      pairedIndividualParticipantIds,
      unpairedParticipantIdsToRemove,
    });
    if (unpairedParticipantIdsToRemove.length) {
      const result = removeEventEntries({
        participantIds: unpairedParticipantIdsToRemove,
        event,
      });
      console.log('remove unpaired', { result });
    }
  }

  const invalidParticipantIds = !!(
    validParticipantIds.length !== participantIds.length
  );
  return !invalidParticipantIds ? SUCCESS : { error: INVALID_PARTICIPANT_IDS };
}
