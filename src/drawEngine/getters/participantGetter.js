import { attributeFilter, makeDeepCopy } from '../../utilities';

export function findParticipant({
  tournamentParticipants = [],
  policyDefinition = {},
  participantId,
}) {
  const participant = tournamentParticipants.reduce(
    (participant, candidate) => {
      return candidate.participantId === participantId
        ? candidate
        : participant;
    },
    undefined
  );
  const participantAttributes = policyDefinition.participant;
  if (participantAttributes) {
    const participantCopy = attributeFilter({
      source: participant,
      template: participantAttributes.participant,
    });
    return makeDeepCopy(participantCopy);
  }
  return makeDeepCopy(participant);
}
