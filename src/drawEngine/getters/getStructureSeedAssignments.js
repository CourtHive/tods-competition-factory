import { findStructure } from './findStructure';

export function getStructureSeedAssignments({
  drawDefinition,
  structure,
  structureId,
}) {
  let error,
    seedAssignments = [];
  if (!structure) {
    ({ structure, error } = findStructure({ drawDefinition, structureId }));
  }
  if (!error) {
    if (structure.seedAssignments) {
      seedAssignments = structure.seedAssignments;
    } else {
      error = 'Missing seeds';
    }
  }
  return { seedAssignments, error };
}
