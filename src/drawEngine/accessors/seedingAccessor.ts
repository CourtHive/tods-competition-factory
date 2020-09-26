import { MAIN } from '../../constants/drawDefinitionConstants';

export function getSeedAssignments({
  drawDefinition,
  structureId,
  stage,
  stageSequence,
}) {
  if (!drawDefinition) return { error: 'Missing drawDefinition' };
  if (!structureId) {
    if (!stage) stage = MAIN;
    if (!stageSequence) stageSequence = 1;
  }

  const { structures } = drawDefinition || [];
  const filteredStructures = structures.filter(structure => {
    if (stageSequence && structure?.stageSequence !== stageSequence)
      return false;
    if (structureId && structure?.structureId !== structureId) return false;
    if (stage && structure?.stage !== stage) return false;
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
