export function getDrawPositionCollectionAssignment({
  collectionPosition,
  drawPositions = [],
  collectionId,
  sideLineUps,
}) {
  if (!collectionId || !collectionPosition) return;

  const drawPositionCollectionAssignment = drawPositions
    ?.map((drawPosition) => {
      const side = sideLineUps?.find(
        (lineUp) => lineUp.drawPosition === drawPosition
      );

      const lineUp = side?.lineUp;
      const teamParticipant = side?.teamParticipant;

      const relevantCompetitor = lineUp?.find((teamCompetitor) => {
        const collectionAssignment = teamCompetitor.collectionAssignments.find(
          (assignment) => assignment.collectionId === collectionId
        );
        return collectionAssignment?.collectionPosition === collectionPosition;
      });

      const participantId = relevantCompetitor?.participantId;

      return (
        participantId && {
          [drawPosition]: { participantId, teamParticipant },
        }
      );
    })
    .filter(Boolean);

  return Object.assign({}, ...drawPositionCollectionAssignment);
}
