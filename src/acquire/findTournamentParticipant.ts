import { ErrorType } from '../constants/errorConditionConstants';
import { Participant } from '../types/tournamentTypes';

export function findTournamentParticipant({
  tournamentRecord,
  participantId,
}): { error?: ErrorType; participant?: Participant } {
  const participants = tournamentRecord.participants || [];
  const participant = participants.reduce((participant, candidate) => {
    return candidate.participantId === participantId ? candidate : participant;
  }, undefined);
  return { participant };
}
