import { extractAttributeValues } from '../../../getters/getAttributeGrouping';

export function getPositionedParticipants({
  candidatePositionAssignments,
  participantsWithContext,
  policyAttributes,
  idCollections,
}) {
  const participantsMap = Object.assign(
    {},
    ...participantsWithContext.map(participant => ({
      [participant.participantId]: participant,
    }))
  );

  return candidatePositionAssignments.map(assignment => {
    const participant = participantsMap[assignment.participantId];
    const { values } = extractAttributeValues({
      participant,
      policyAttributes,

      idCollections,
      participants: participantsWithContext,
    });
    return Object.assign({}, assignment, { values });
  });
}
