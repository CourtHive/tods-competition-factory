import { SUCCESS } from 'src/constants/resultConstants';

export function mergeParticipants({tournamentRecord, participants: incomingParticipants}) {
  if (!tournamentRecord.participants) tournamentRecord.participants = [];

  incomingParticipants = incomingParticipants
    .filter(participant=> participant.participantId);

  const id_map = Object.assign(...incomingParticipants.map(p => ({ [p.participantId]: p })));

  // check for overlap with existing players, add any newly retrieved attributes to existing
  let modifiedParticipants = 0;
  tournamentRecord.participants.forEach(p => {
     if (id_map[p.participantId]) {
       Object.assign(p, id_map[p.participantId]);
       modifiedParticipants++;
     }
  });

  const existingParticipantIds = tournamentRecord.participants.map(p=>p.participantId);
  const newParticipants = incomingParticipants
    .filter(p => existingParticipantIds.includes(p.participantId));

  if (newParticipants.length) {
    tournamentRecord.participants = tournamentRecord.participants.concat(...newParticipants);
  }
  
  if (newParticipants.length || modifiedParticipants) {
    return SUCCESS;
  }
}