import { findExtension } from '../../tournamentEngine/governors/queryGovernor/extensionQueries';
import { structureSort } from './structureSort';

import { ROUND_TARGET } from '../../constants/extensionConstants';
import { ITEM } from '../../constants/drawDefinitionConstants';
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

  const structure = allStructures.find(
    (structure) => structure.structureId === structureId
  );

  if (!structure) return { error: STRUCTURE_NOT_FOUND };

  const containingStructure =
    structure.structureType === ITEM &&
    allStructures.find((s) =>
      s.structures?.some((s) => s.structureId === structureId)
    );

  return { structure, containingStructure };
}

/*
  TESTS: structureGetter.test.js
*/
export function getDrawStructures({
  drawDefinition,
  stageSequence,
  roundTarget,
  stage,
}) {
  const error = !drawDefinition
    ? MISSING_DRAW_DEFINITION
    : !drawDefinition.structures
    ? MISSING_STRUCTURES
    : undefined;

  if (error) return { error };

  const isRoundTarget = (structure) => {
    const value = findExtension({
      element: structure,
      name: ROUND_TARGET,
    })?.extension?.value;
    return !roundTarget || roundTarget === value;
  };

  const structures = drawDefinition.structures
    ?.filter(isStage)
    .filter(isStageSequence)
    .filter(isRoundTarget)
    .sort(structureSort);
  return { structures };

  function isStage(structure) {
    return !stage || structure.stage === stage;
  }
  function isStageSequence(structure) {
    return !stageSequence || structure.stageSequence === stageSequence;
  }
}
