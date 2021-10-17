export function removeCollectionAssignment({
  collectionPosition,
  dualMatchUpSide,
  participantId,
  collectionId,
}) {
  const modifiedLineUp =
    dualMatchUpSide?.lineUp
      ?.map((teamCompetitor) => {
        if (teamCompetitor.participantId !== participantId) {
          return teamCompetitor;
        }
        const collectionAssignments =
          teamCompetitor.collectionAssignments?.filter((assignment) => {
            const target =
              assignment.collectionId === collectionId &&
              assignment.collectionPosition === collectionPosition;
            return !target;
          });
        return {
          participantId: teamCompetitor.participantId,
          collectionAssignments,
        };
      })
      .filter(Boolean) || [];

  return { modifiedLineUp };
}
