import {
  INVALID_OBJECT,
  MISSING_PARTICIPANTS,
  MISSING_PARTICIPANT_ID,
  MISSING_TOURNAMENT_RECORD,
} from '../../constants/errorConditionConstants';
import { SINGLES } from '../../constants/eventConstants';
import { PAIR, TEAM } from '../../constants/participantTypes';
import { intersection } from '../../utilities/arrays';

export function findTournamentParticipant({ tournamentRecord, participantId }) {
  const participants = tournamentRecord.participants || [];
  const participant = participants.reduce((participant, candidate) => {
    return candidate.participantId === participantId ? candidate : participant;
  }, undefined);
  return { participant };
}

/**
 *
 * @param {object} tournamentRecord - tournament object (passed automatically from tournamentEngine state)
 * @param {string} participantId - id of participant for which events (eventName, eventId) are desired
 */
export function getParticipantEventDetails({
  tournamentRecord,
  participantId,
}) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!participantId) return { error: MISSING_PARTICIPANT_ID };

  // relveantParticipantIds is the target participantId along with any TEAM or PAIR participantIds to which participantId belongs
  const relevantParticipantIds = [participantId].concat(
    (tournamentRecord.participants || [])
      .filter(
        participant =>
          [TEAM, PAIR].includes(participant.participantType) &&
          participant.individualParticipantIds?.includes(participantId)
      )
      .map(participant => participant.participantId)
  );

  const relevantEvents = (tournamentRecord.events || [])
    .filter(event => {
      const enteredParticipantIds = (event?.entries || []).map(
        entry => entry.participantId
      );
      const overlap = intersection(
        enteredParticipantIds,
        relevantParticipantIds
      );
      const presentInEvent = !!overlap.length;
      return presentInEvent;
    })
    .map(event => ({ eventName: event.eventName, eventId: event.eventId }));

  return { eventDetails: relevantEvents };
}

/**
 *
 * @param {object} tournamentRecord - tournament object (passed automatically from tournamentEngine state)
 * @param {object} participantFilters - attribute arrays with filter value strings
 */
export function getTournamentParticipants({
  tournamentRecord,
  participantFilters,
}) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!tournamentRecord.participants) return { error: MISSING_PARTICIPANTS };

  let tournamentParticipants = tournamentRecord.participants;
  if (!participantFilters) return { tournamentParticipants };
  if (typeof participantFilters !== 'object') return { error: INVALID_OBJECT };
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };

  const {
    //    drawIds,
    eventIds,
    //    structureIds,
    //    signInStates,
    participantTypes,
    participantRoles,
    //    keyValues,
  } = participantFilters;

  if (isValidFilterArray(participantTypes)) {
    tournamentParticipants = tournamentParticipants.filter(participant =>
      participantTypes.includes(participant.participantType)
    );
  }

  if (isValidFilterArray(participantRoles)) {
    tournamentParticipants = tournamentParticipants.filter(participant =>
      participantRoles.includes(participant.participantRole)
    );
  }

  if (
    isValidFilterArray(eventIds) &&
    isValidFilterArray(tournamentRecord.events)
  ) {
    const participantIds = tournamentRecord.events
      .filter(event => eventIds.includes(event.eventId))
      .map(event => {
        const enteredParticipantIds = event.entries.map(
          entry => entry.participantId
        );
        if (event.eventType === SINGLES) return enteredParticipantIds;
        const individualParticipantIds = tournamentRecord.participants
          .filter(participant =>
            enteredParticipantIds.includes(participant.participantId)
          )
          .map(participant => participant.individualParticipantIds)
          .flat(1);
        return enteredParticipantIds.concat(...individualParticipantIds);
      })
      .flat(1);
    tournamentParticipants = tournamentParticipants.filter(participant =>
      participantIds.includes(participant.participantId)
    );
  }

  return { tournamentParticipants };
}

function isValidFilterArray(filter) {
  return filter && Array.isArray(filter) && filter.length;
}
