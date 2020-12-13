import { SUCCESS } from '../../../constants/resultConstants';

export function mergeParticipants({
  tournamentRecord,
  participants: incomingParticipants = [],
}) {
  if (!tournamentRecord.participants) tournamentRecord.participants = [];

  incomingParticipants = incomingParticipants.filter(
    (participant) => participant.participantId
  );

  const idMap = Object.assign(
    ...incomingParticipants.map((p) => ({ [p.participantId]: p }))
  );

  // check for overlap with existing players, add any newly retrieved attributes to existing
  let modifiedParticipants = 0;
  tournamentRecord.participants.forEach((p) => {
    if (idMap[p.participantId]) {
      Object.assign(p, idMap[p.participantId]);
      modifiedParticipants++;
    }
  });

  const existingParticipantIds = tournamentRecord.participants.map(
    (p) => p.participantId
  );
  const newParticipants = incomingParticipants.filter((p) =>
    existingParticipantIds.includes(p.participantId)
  );

  if (newParticipants.length) {
    tournamentRecord.participants = tournamentRecord.participants.concat(
      ...newParticipants
    );
  }

  if (newParticipants.length || modifiedParticipants) {
    return SUCCESS;
  }
}
