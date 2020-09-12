import { findStructure } from './findStructure';
import { QUALIFYING } from '../../constants/drawDefinitionConstants';
import { getAllStructureMatchUps } from './getMatchUps/getAllStructureMatchUps';

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

export function getStructureQualifiersCount({
  drawDefinition,
  policies,
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
      const { matchUps } = getAllStructureMatchUps({
        drawDefinition,
        structure,
        policies,
      });
      qualifiersCount = matchUps.reduce((count, matchUp) => {
        return count + (matchUp.finishingRound === 1 ? 1 : 0);
      }, 0);
    }
  }
  return { qualifiersCount, error };
}
