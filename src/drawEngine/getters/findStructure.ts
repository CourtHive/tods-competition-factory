import { findExtension } from '../../tournamentEngine/governors/queryGovernor/extensionQueries';
import {
  ResultType,
  decorateResult,
} from '../../global/functions/decorateResult';
import { structureSort } from './structureSort';

import { ITEM, validStages } from '../../constants/drawDefinitionConstants';
import { ROUND_TARGET } from '../../constants/extensionConstants';
import {
  MISSING_STRUCTURES,
  STRUCTURE_NOT_FOUND,
  MISSING_STRUCTURE_ID,
  MISSING_DRAW_DEFINITION,
  ErrorType,
} from '../../constants/errorConditionConstants';

import { DrawDefinition, Structure } from '../../types/tournamentFromSchema';

type FindStructureArgs = {
  drawDefinition?: DrawDefinition;
  structureId?: string;
};

type FoundStructureResult = {
  containingStructure?: Structure;
  structure: Structure;
  error?: ErrorType;
};

export function findStructure({
  drawDefinition,
  structureId,
}: FindStructureArgs): ResultType | FoundStructureResult {
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
    allStructures.find(
      (s) => s.structures?.some((s) => s.structureId === structureId)
    );

  return { structure, containingStructure };
}

type GetDrawStructuresArgs = {
  drawDefinition?: DrawDefinition;
  withStageGrouping?: boolean;
  stageSequences?: string[];
  stageSequence?: number;
  roundTarget?: number;
  stages?: string[];
  sortConfig?: any;
  stage?: string;
};

type FoundDrawStructure = {
  stageStructures?: Structure[];
  structures: Structure[];
};

export function getDrawStructures({
  withStageGrouping,
  drawDefinition,
  stageSequences,
  stageSequence,
  roundTarget,
  sortConfig,
  stages,
  stage,
}: GetDrawStructuresArgs): ResultType | FoundDrawStructure {
  const error =
    (!drawDefinition && MISSING_DRAW_DEFINITION) ||
    (!drawDefinition?.structures && MISSING_STRUCTURES) ||
    undefined;

  if (error)
    return decorateResult({ result: { error }, stack: 'getDrawStructure' });

  const isRoundTarget = (structure) => {
    const value = findExtension({
      element: structure,
      name: ROUND_TARGET,
    })?.extension?.value;
    return !roundTarget || roundTarget === value;
  };

  const structures = drawDefinition?.structures
    ?.filter(isStage)
    .filter(isStageSequence)
    .filter(isRoundTarget)
    .sort((a, b) => structureSort(a, b, sortConfig));

  const stageStructures =
    withStageGrouping &&
    Object.assign(
      {},
      ...validStages
        .map((stage) => {
          const relevantStructures = structures?.filter(
            (structure) => structure.stage === stage
          );
          return relevantStructures?.length && { [stage]: relevantStructures };
        })
        .filter(Boolean)
    );

  return { structures, stageStructures };

  function isStage(structure) {
    return (
      (!stage && !Array.isArray(stages)) ||
      (stage && structure.stage === stage) ||
      (Array.isArray(stages) && stages.includes(structure.stage))
    );
  }
  function isStageSequence(structure) {
    return (
      (!stageSequence && !Array.isArray(stageSequences)) ||
      (stageSequence && structure.stageSequence === stageSequence) ||
      (Array.isArray(stageSequences) &&
        stageSequences.includes(structure.stageSequence))
    );
  }
}
