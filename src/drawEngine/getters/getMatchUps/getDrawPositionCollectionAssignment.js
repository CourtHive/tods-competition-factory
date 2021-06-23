export function getDrawPositionCollectionAssignment({
  collectionId,
  collectionPosition,
  drawPositions = [],
  sideLineUps,
}) {
  if (!collectionId || !collectionPosition) return;

  const drawPositionCollectionAssignment = drawPositions
    ?.map((drawPosition) => {
      const lineUp = sideLineUps?.find(
        (lineUp) => lineUp.drawPosition === drawPosition
      )?.lineUp;

      const relevantCompetitor = lineUp?.find((teamCompetitor) => {
        const collectionAssignment = teamCompetitor.collectionAssignments.find(
          (assignment) => assignment.collectionId === collectionId
        );
        return collectionAssignment?.collectionPosition === collectionPosition;
      });

      const participantId = relevantCompetitor?.participantId;
      return participantId && { [drawPosition]: participantId };
    })
    .filter((f) => f);
  return Object.assign({}, ...drawPositionCollectionAssignment);
}
