import { structureSort } from './structureSort';

import {
  MISSING_STRUCTURES,
  STRUCTURE_NOT_FOUND,
  MISSING_STRUCTURE_ID,
  MISSING_DRAW_DEFINITION,
} from '../../constants/errorConditionConstants';

/*
  TESTS: structureGetter.test.js
*/
export function findStructure({ drawDefinition, structureId }) {
  if (!drawDefinition) return { error: MISSING_DRAW_DEFINITION };
  if (!structureId) return { error: MISSING_STRUCTURE_ID };
  const { structures } = getDrawStructures({ drawDefinition });
  const allStructures = structures
    .map((structure) => {
      return structure.structures
        ? [].concat(...structure.structures, structure)
        : structure;
    })
    .flat();
  const structure = allStructures.reduce((target, current) => {
    return current.structureId === structureId ? current : target;
  }, undefined);
  if (!structure) return { error: STRUCTURE_NOT_FOUND };
  return { structure };
}

/*
  TESTS: structureGetter.test.js
*/
export function getDrawStructures({ stage, stageSequence, drawDefinition }) {
  const error = !drawDefinition
    ? MISSING_DRAW_DEFINITION
    : !drawDefinition.structures
    ? MISSING_STRUCTURES
    : undefined;

  if (error) return { error };

  const structures = drawDefinition.structures
    ?.filter(isStage)
    .filter(isStageSequence)
    .sort(structureSort);
  return { structures };

  function isStage(structure) {
    return !stage || structure.stage === stage;
  }
  function isStageSequence(structure) {
    return !stageSequence || structure.stageSequence === stageSequence;
  }
}
