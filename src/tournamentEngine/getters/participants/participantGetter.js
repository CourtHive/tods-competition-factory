import { findParticipant } from '../../../drawEngine/getters/participantGetter';
import { makeDeepCopy } from '../../../utilities';

export function findTournamentParticipant({ tournamentRecord, participantId }) {
  const participants = tournamentRecord.participants || [];
  const participant = participants.reduce((participant, candidate) => {
    return candidate.participantId === participantId ? candidate : participant;
  }, undefined);
  return { participant };
}

export function publicFindParticipant({
  tournamentRecord,
  participantId,
  personId,
  policyDefinition,
}) {
  const tournamentParticipants = tournamentRecord.participants || [];
  const participant = findParticipant({
    tournamentParticipants,
    participantId,
    personId,
    policyDefinition,
  });
  return { participant: makeDeepCopy(participant) };
}
