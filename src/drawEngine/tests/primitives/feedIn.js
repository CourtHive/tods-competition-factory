import { reset, initialize, mainDrawPositions } from './primitives';
import { getDrawStructures } from '../../getters/findStructure';

import { drawEngine } from '../../sync';
import { MAIN, CONSOLATION } from '../../../constants/drawDefinitionConstants';

export function feedInChampionship({ drawSize, drawType, feedPolicy }) {
  reset();
  initialize();
  mainDrawPositions({ drawSize });
  const result = drawEngine
    .devContext(true)
    .generateDrawType({ drawType, feedPolicy });
  if (result.error) return result;

  const { links } = result;
  const { drawDefinition } = drawEngine.getState();
  const {
    structures: [mainStructure],
  } = getDrawStructures({ drawDefinition, stage: MAIN });
  const mainDrawMatchUps = mainStructure?.matchUps;
  const {
    structures: [consolationStructure],
  } = getDrawStructures({ drawDefinition, stage: CONSOLATION });
  const consolationMatchUps = consolationStructure?.matchUps;

  return {
    links,
    drawDefinition,
    mainDrawMatchUps,
    consolationMatchUps,
    consolationStructure,
  };
}
