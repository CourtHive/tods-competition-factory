/**
 *
 * @param {object[]} matchUps
 * @param {object[]} positionAssignments - assignment objects which associate drawPositions with participantIds
 *
 * Returns an array of drawPositions which have not been filled
 */

export function getUnfilledPositions({
  drawPositionGroups,
  positionAssignments,
}) {
  const assignmentMap = Object.assign(
    {},
    ...positionAssignments.map((assignment) => ({
      [assignment.drawPosition]: assignment,
    }))
  );

  const unpairedPositions = drawPositionGroups
    .map((drawPositions) => {
      const unfilled = drawPositions
        .filter(Boolean)
        .map((drawPosition) => assignmentMap[drawPosition])
        .filter(Boolean)
        .filter((assignment) => !assignment.participantId && !assignment.bye)
        .map((assignment) => assignment.drawPosition);
      return unfilled;
    })
    .flat()
    .filter(Boolean);

  return unpairedPositions;
}
