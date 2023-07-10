import { getStructureSeedAssignments } from './getStructureSeedAssignments';
import { structureAssignedDrawPositions } from './positionsGetter';

export function getStructurePositionedSeeds({
  provisionalPositioning,
  drawDefinition,
  structure,
  event,
}) {
  const { positionAssignments } = structureAssignedDrawPositions({ structure });
  const { seedAssignments } = getStructureSeedAssignments({
    provisionalPositioning,
    drawDefinition,
    structure,
    event,
  });
  const seedMap = Object.assign(
    {},
    ...seedAssignments
      .filter((assignment) => assignment.participantId)
      .map((assignment) => ({ [assignment.participantId]: assignment }))
  );
  return positionAssignments
    .map((assignment) => {
      return !seedMap[assignment.participantId]
        ? ''
        : {
            ...assignment,
            seedNumber: seedMap[assignment.participantId].seedNumber,
            seedValue: seedMap[assignment.participantId].seedValue,
          };
    })
    .filter(Boolean);
}
