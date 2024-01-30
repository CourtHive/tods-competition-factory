import { getDrawStructures } from '@Acquire/findStructure';

// constants and types
import { generateDrawTypeAndModifyDrawDefinition } from '@Assemblies/generators/drawDefinitions/generateDrawTypeAndModifyDrawDefinition';
import { newDrawDefinition } from '@Assemblies/generators/drawDefinitions/newDrawDefinition';
import { setStageDrawSize } from '@Mutate/drawDefinitions/entryGovernor/stageEntryCounts';
import { MAIN, CONSOLATION } from '../../../../constants/drawDefinitionConstants';
import { DrawDefinition } from '@Types/tournamentTypes';
import { ResultType } from '@Types/factoryTypes';

export function feedInChampionship(params): ResultType & {
  consolationStructure?: any;
  consolationMatchUps?: any;
  mainDrawMatchUps?: any;
  drawDefinition?: DrawDefinition;
  links?: any;
} {
  const { drawSize, drawType, feedPolicy, drawTypeCoercion } = params;
  const drawDefinition: DrawDefinition = newDrawDefinition();
  setStageDrawSize({ drawDefinition, stage: MAIN, drawSize });
  const result = generateDrawTypeAndModifyDrawDefinition({
    drawTypeCoercion,
    drawDefinition,
    feedPolicy,
    drawType,
  });
  if (result.error) return result;

  const { links } = result;
  const {
    structures: [mainStructure],
  } = getDrawStructures({ drawDefinition, stage: MAIN });
  const mainDrawMatchUps = mainStructure?.matchUps;
  const {
    structures: [consolationStructure],
  } = getDrawStructures({ drawDefinition, stage: CONSOLATION });
  const consolationMatchUps = consolationStructure?.matchUps;

  return {
    consolationStructure,
    consolationMatchUps,
    mainDrawMatchUps,
    drawDefinition,
    links,
  };
}
