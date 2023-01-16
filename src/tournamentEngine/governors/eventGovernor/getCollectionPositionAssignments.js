export function getCollectionPositionAssignments({
  collectionPosition,
  collectionId,
  lineUp,
}) {
  if (!lineUp) return;

  const getOrderValue = (order) => (order === undefined ? -1 : order);
  const competitorAssignments = lineUp
    .map((teamCompetitor) => {
      const { collectionAssignments, participantId } = teamCompetitor;
      const assignment = collectionAssignments?.find(
        (assignment) =>
          assignment.collectionPosition === collectionPosition &&
          assignment.collectionId === collectionId
      );
      return assignment && { participantId, ...assignment };
    })
    .filter(Boolean)
    .sort(
      (a, b) =>
        getOrderValue(a.substitutionOrder) - getOrderValue(b.substitutionOrder)
    );

  let assignedParticipantIds = [];
  for (const competitorAssignment of competitorAssignments) {
    const { participantId, previousParticipantId } = competitorAssignment;
    if (assignedParticipantIds.includes(participantId)) continue;
    if (previousParticipantId)
      assignedParticipantIds = assignedParticipantIds.filter(
        (id) => id !== previousParticipantId
      );
    assignedParticipantIds.push(participantId);
  }

  return assignedParticipantIds;
}
