import { QUALIFYING } from '../../constants/drawDefinitionConstants';
import { getAllStructureMatchUps } from '../../drawEngine/getters/getMatchUps';

/*
  TESTS: structureGetter.test.js
*/
export function findStructure({ drawDefinition, structureId }) {
  const { structures } = drawStructures({ drawDefinition });
  const structure = structures.reduce((target, current) => {
    return current.structureId === structureId ? current : target;
  }, undefined);
  if (!structure) return { error: 'Structure not found' };
  return { structure };
}

export function getDrawStructures({
  stage,
  stageSequence,
  drawDefinition,
} = {}) {
  const stageStructures = drawDefinition.structures
    .filter(isStage)
    .filter(isStageSequence);
  return { structures: stageStructures };

  function isStage(structure) {
    return structure.stage === stage;
  }
  function isStageSequence(structure) {
    return !stageSequence || structure.stageSequence === stageSequence;
  }
}

/*
  TESTS: structureGetter.test.js
*/
export function drawStructures({ stage, stageSequence, drawDefinition }) {
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

export function getStructureQualifiersCount({
  drawDefinition,
  structure,
  structureId,
}) {
  let error, qualifiersCount;
  if (!structure) {
    ({ structure, error } = findStructure({ drawDefinition, structureId }));
  }
  if (!error) {
    if (structure.stage !== QUALIFYING) {
      error = 'Structure is not Qualifying';
    } else {
      const { matchUps } = getAllStructureMatchUps({ structure });
      qualifiersCount = matchUps.reduce((count, matchUp) => {
        return count + (matchUp.finishingRound === 1 ? 1 : 0);
      }, 0);
    }
  }
  return { qualifiersCount, error };
}
