export function getSide({
  drawPositionCollectionAssignment,
  positionAssignments,
  displaySideNumber,
  seedAssignments,
  drawPosition,
  isFeedRound,
  sideNumber,
}) {
  const assignment = positionAssignments.find(
    (assignment) => assignment.drawPosition === drawPosition
  );
  const participantId =
    (drawPositionCollectionAssignment &&
      drawPositionCollectionAssignment[drawPosition]) ||
    assignment?.participantId;
  const sideValue = assignment
    ? getSideValue({
        displaySideNumber,
        seedAssignments,
        participantId,
        assignment,
        sideNumber,
      })
    : {};

  if (isFeedRound) {
    if (sideNumber === 1) {
      Object.assign(sideValue, { participantFed: true });
    } else {
      Object.assign(sideValue, { participantAdvanced: true });
    }
  }
  return sideValue;
}

function getSideValue({
  displaySideNumber,
  seedAssignments,
  participantId,
  assignment,
  sideNumber,
}) {
  const side = {
    drawPosition: assignment.drawPosition,
    displaySideNumber,
    sideNumber,
  };
  if (participantId) {
    const seeding = getSeeding({ seedAssignments, participantId });
    Object.assign(side, seeding, { participantId });
  } else if (assignment.bye) {
    Object.assign(side, { bye: true });
  } else if (assignment.qualifier) {
    Object.assign(side, { qualifier: true });
  }

  return side;
}
function getSeeding({ seedAssignments, participantId }) {
  return seedAssignments.reduce((seeding, assignment) => {
    // seedProxy is used for playoff positioning only and should not be displayed as seeding
    return !assignment.seedProxy && assignment.participantId === participantId
      ? assignment
      : seeding;
  }, undefined);
}
