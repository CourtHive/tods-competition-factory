import { attributeFilter, makeDeepCopy } from '../../utilities';

export function findParticipant({
  tournamentParticipants = [],
  policyDefinitions = {},
  participantId,
  personId,
}) {
  const participant = tournamentParticipants.find(
    (candidate) =>
      (participantId && candidate.participantId === participantId) ||
      (personId && candidate.person && candidate.person.personId === personId)
  );

  const participantAttributes = policyDefinitions.participant;

  if (participantAttributes?.participant) {
    const participantCopy = attributeFilter({
      source: participant,
      template: participantAttributes.participant,
    });
    return makeDeepCopy(participantCopy);
  }
  return makeDeepCopy(participant);
}
