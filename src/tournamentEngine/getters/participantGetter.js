export function findTournamentParticipant({tournamentRecord, participantId}) {
  const participants = tournamentRecord.participants || [];
  const participant = participants.reduce((participant, candidate) => {
    return candidate.participantId === participantId ? candidate : participant;
  }, undefined);
  return { participant };
}
