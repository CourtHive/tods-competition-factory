export function getSide({
  positionAssignments,
  seedAssignments,
  drawPosition,
  isFeedRound,
  sideNumber,
}) {
  const sideValue = positionAssignments.reduce((side, assignment) => {
    const participantId = assignment.participantId;
    const sideValue =
      assignment.drawPosition === drawPosition
        ? getSideValue({
            seedAssignments,
            assignment,
            sideNumber,
            participantId,
          })
        : side;
    return sideValue;
  }, {});

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
  seedAssignments,
  assignment,
  participantId,
  sideNumber,
}) {
  const side = { sideNumber, drawPosition: assignment.drawPosition };
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
