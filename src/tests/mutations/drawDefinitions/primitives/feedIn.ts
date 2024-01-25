import { getDrawStructures } from '../../../../acquire/findStructure';

import { generateDrawTypeAndModifyDrawDefinition } from '../../../../assemblies/generators/drawDefinitions/generateDrawTypeAndModifyDrawDefinition';
import { newDrawDefinition } from '../../../../assemblies/generators/drawDefinitions/newDrawDefinition';
import { setStageDrawSize } from '../../../../mutate/drawDefinitions/entryGovernor/stageEntryCounts';
import { ResultType } from '../../../../global/functions/decorateResult';
import { DrawDefinition } from '../../../../types/tournamentTypes';
import { MAIN, CONSOLATION } from '../../../../constants/drawDefinitionConstants';

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
