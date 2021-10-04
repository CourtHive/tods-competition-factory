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
    const filteredParticipant = attributeFilter({
      template: participantAttributes.participant,
      source: participant,
    });
    return filteredParticipant;
  }
  return makeDeepCopy(participant);
}
