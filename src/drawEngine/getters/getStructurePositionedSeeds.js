import { getStructureSeedAssignments } from './getStructureSeedAssignments';
import { structureAssignedDrawPositions } from './positionsGetter';

export function getStructurePositionedSeeds({ drawDefinition, structure }) {
  const { positionAssignments } = structureAssignedDrawPositions({ structure });
  const { seedAssignments } = getStructureSeedAssignments({
    drawDefinition,
    structure,
  });
  const seedMap = Object.assign(
    {},
    ...seedAssignments
      .filter((assignment) => assignment.participantId)
      .map((assignment) => ({ [assignment.participantId]: assignment }))
  );
  const positionedSeeds = positionAssignments
    .map((assignment) => {
      return !seedMap[assignment.participantId]
        ? ''
        : Object.assign({}, assignment, {
            seedNumber: seedMap[assignment.participantId].seedNumber,
            seedValue: seedMap[assignment.participantId].seedValue,
          });
    })
    .filter((f) => f);
  return positionedSeeds;
}
