/*
  TESTS: structureGetter.test.js
*/
export function findStructure({ drawDefinition, structureId }) {
  const { structures } = getDrawStructures({ drawDefinition });
  const structure = structures.reduce((target, current) => {
    return current.structureId === structureId ? current : target;
  }, undefined);
  if (!structure) return { error: 'Structure not found' };
  return { structure };
}

/*
  TESTS: structureGetter.test.js
*/
export function getDrawStructures({ stage, stageSequence, drawDefinition }) {
  const error = !drawDefinition
    ? 'Missing drawDefinition'
    : !drawDefinition.structures
    ? 'Missing structures'
    : undefined;
  const structures =
    (drawDefinition &&
      drawDefinition.structures.filter(isStage).filter(isStageSequence)) ||
    [];
  return { structures, error };

  function isStage(structure) {
    return !stage || structure.stage === stage;
  }
  function isStageSequence(structure) {
    return !stageSequence || structure.stageSequence === stageSequence;
  }
}
