import { reset, initialize, mainDrawPositions } from './primitives';
import { getDrawStructures } from '../../getters/findStructure';

import { drawEngine } from '../../../drawEngine';
import { MAIN, CONSOLATION } from '../../../constants/drawDefinitionConstants';

export function feedInChampionship({ drawSize, drawType }) {
  reset();
  initialize();
  mainDrawPositions({ drawSize });
  const { links } = drawEngine.generateDrawType({ drawType });
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
