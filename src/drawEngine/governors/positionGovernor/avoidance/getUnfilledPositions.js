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
    ...positionAssignments.map(assignment => ({
      [assignment.drawPosition]: assignment,
    }))
  );

  const unpairedPositions = drawPositionGroups
    .map(drawPositions => {
      const unfilled = drawPositions
        .filter(f => f)
        .map(drawPosition => assignmentMap[drawPosition])
        .filter(assignment => !assignment.participantId)
        .map(assignment => assignment.drawPosition);
      return unfilled;
    })
    .flat()
    .filter(f => f);

  return unpairedPositions;
}
