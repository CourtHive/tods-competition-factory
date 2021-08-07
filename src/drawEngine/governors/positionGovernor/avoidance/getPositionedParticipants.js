import { extractAttributeValues } from '../../../getters/getAttributeGrouping';

export function getPositionedParticipants({
  candidatePositionAssignments,
  participantsWithGroupings,
  policyAttributes,
  idCollections,
}) {
  const participantsMap = Object.assign(
    {},
    ...participantsWithGroupings.map((participant) => ({
      [participant.participantId]: participant,
    }))
  );

  return candidatePositionAssignments.map((assignment) => {
    const participant = participantsMap[assignment.participantId];
    const { values } = extractAttributeValues({
      participant,
      policyAttributes,

      idCollections,
      participants: participantsWithGroupings,
    });
    return { ...assignment, values };
  });
}
