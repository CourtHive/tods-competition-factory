import { filterParticipants } from './participants/filterParticipants';

import { MISSING_TOURNAMENT_RECORD } from '../../constants/errorConditionConstants';

export function getTournamentPersons({ tournamentRecord, participantFilters }) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  let tournamentParticipants = tournamentRecord.participants || [];

  if (participantFilters)
    tournamentParticipants = filterParticipants({
      tournamentRecord,
      participantFilters,
      participants: tournamentParticipants,
    });

  const tournamentPersons = {};

  const extractPerson = (participant) => {
    if (participant.person) {
      const { personId } = participant.person;
      if (tournamentPersons[personId]) {
        tournamentPersons[personId].participantIds.push(
          participant.participantId
        );
      } else {
        tournamentPersons[personId] = Object.assign({}, participant.person, {
          participantIds: [participant.participantId],
        });
      }
    }
  };

  tournamentParticipants.forEach((participant) => {
    if (participant.person) extractPerson(participant);
    if (participant.individualParticipants) {
      participant.individualParticipants.forEach(extractPerson);
    }
  });

  return { tournamentPersons: Object.values(tournamentPersons) };
}
