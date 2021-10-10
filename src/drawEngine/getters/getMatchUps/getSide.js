/**
 *
 * @param {object} drawPositionCollectionAssignment - mapping of drawPositions to participantIds derived from collectionAssignments
 * @param {object[]} positionAssignments - mapping of drawPositions to participantIds (in TIES this is TEAM participantId)
 * @param {number} displaySideNumber - accounts for both top and bottom feed arm positioning
 * @param {object[]} seedAssignments - mapping of participantIds to seedNumber and seedValue
 * @param {number} drawPosition -
 * @param {boolean} isFeedRound - whether a round includes fed drawPositions
 * @param {number} sideNumber - 1 or 2
 * @returns {object} properties require for side attribute of matchUp.sides array
 */
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
  const participantId = drawPositionCollectionAssignment
    ? drawPositionCollectionAssignment[drawPosition]?.participantId
    : assignment?.participantId;

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

  const teamParticipant =
    drawPositionCollectionAssignment?.[drawPosition]?.teamParticipant;

  const participant =
    drawPositionCollectionAssignment?.[drawPosition]?.participant;

  if (participant) Object.assign(sideValue, { participant });
  if (teamParticipant) Object.assign(sideValue, { teamParticipant });

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
  return seedAssignments.find(
    (assignment) =>
      !assignment.seedProxy && assignment.participantId === participantId
  );
}
