export function getStructureSeedAssignments({ drawDefinition, structureId }) {
  if (!drawDefinition) return { error: 'Missing drawDefinition' };
  if (!structureId) return { error: 'Missing structuerId' };

  const { structures } = drawDefinition || [];
  const filteredStructures = structures.filter(structure => {
    if (structureId && structure?.structureId !== structureId) return false;
    return true;
  });

  /**
   * seedLimit provides guidance that number of seeds should not exceed number of drawPositions
   */
  return filteredStructures.map(structure => {
    const {
      structureId,
      seedAssignments,
      positionAssignments,
      stage,
      stageSequence,
    } = structure;
    const seedLimit = structure.seedLimit || positionAssignments.length;
    return { structureId, seedAssignments, seedLimit, stage, stageSequence };
  });
}
