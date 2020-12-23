import { makeDeepCopy } from '../../../utilities';

import {
  INVALID_OBJECT,
  MISSING_PARTICIPANTS,
  MISSING_TOURNAMENT_RECORD,
} from '../../../constants/errorConditionConstants';
import { SINGLES } from '../../../constants/eventConstants';
import { PAIR, TEAM } from '../../../constants/participantTypes';
import { addParticipantStatistics } from './addParticipantStatistics';

/**
 * Returns deepCopies of tournament participants filtered by participantFilters which are arrays of desired participant attribute values
 *
 * @param {object} tournamentRecord - tournament object (passed automatically from tournamentEngine state)
 * @param {object} participantFilters - attribute arrays with filter value strings
 * @param {boolean} inContext - adds individualParticipants for all individualParticipantIds
 * @param {boolean} withStatistics - adds events: { [eventId]: eventName }, matchUps: { [matchUpId]: score }, statistics: [{ statCode: 'winRatio'}]
 *
 */
export function getTournamentParticipants({
  tournamentRecord,

  participantFilters,

  inContext,
  withStatistics,
}) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!tournamentRecord.participants) return { error: MISSING_PARTICIPANTS };

  let tournamentParticipants = tournamentRecord.participants.map(
    (participant) => makeDeepCopy(participant)
  );

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

  const tournamentEvents =
    (isValidFilterArray(eventIds) &&
      tournamentRecord.events.filter((event) =>
        eventIds.includes(event.eventId)
      )) ||
    tournamentRecord.events ||
    [];

  if (isValidFilterArray(participantTypes)) {
    tournamentParticipants = tournamentParticipants.filter((participant) =>
      participantTypes.includes(participant.participantType)
    );
  }

  if (isValidFilterArray(participantRoles)) {
    tournamentParticipants = tournamentParticipants.filter((participant) =>
      participantRoles.includes(participant.participantRole)
    );
  }

  if (tournamentEvents.length && eventIds) {
    const participantIds = tournamentEvents
      .filter((event) => eventIds.includes(event.eventId))
      .map((event) => {
        const enteredParticipantIds = event.entries.map(
          (entry) => entry.participantId
        );
        if (event.eventType === SINGLES) return enteredParticipantIds;
        const individualParticipantIds = tournamentRecord.participants
          .filter((participant) =>
            enteredParticipantIds.includes(participant.participantId)
          )
          .map((participant) => participant.individualParticipantIds)
          .flat(1);
        return enteredParticipantIds.concat(...individualParticipantIds);
      })
      .flat(1);
    tournamentParticipants = tournamentParticipants.filter((participant) =>
      participantIds.includes(participant.participantId)
    );
  }

  if (inContext) {
    tournamentParticipants.forEach((participant) => {
      if ([PAIR, TEAM].includes(participant.participantType)) {
        participant.individualParticipants = participant.individualParticipantIds.map(
          (participantId) => {
            const individualParticipant = tournamentRecord.participants.find(
              (p) => p.participantId === participantId
            );
            return makeDeepCopy(individualParticipant);
          }
        );
      }
    });
  }

  if (withStatistics) {
    addParticipantStatistics({
      tournamentRecord,
      tournamentEvents,
      tournamentParticipants,
    });
  }

  return { tournamentParticipants };
}

function isValidFilterArray(filter) {
  return filter && Array.isArray(filter) && filter.length;
}
