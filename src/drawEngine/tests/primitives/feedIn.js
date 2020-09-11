import { drawEngine } from '../../../drawEngine';
import { reset, initialize, mainDrawPositions } from './primitives';
import { drawStructures } from '../../getters/structureGetter';

import { MAIN, CONSOLATION } from '../../../constants/drawDefinitionConstants';

export function feedInChampionship({ drawSize, drawType }) {
  reset();
  initialize();
  mainDrawPositions({ drawSize });
  const { links } = drawEngine.generateDrawType({ drawType });
  const { drawDefinition } = drawEngine.getState();
  const {
    structures: [mainDraw],
  } = drawStructures({ drawDefinition, stage: MAIN });
  const mainDrawMatchUps = mainDraw && mainDraw.matchUps;
  const {
    structures: [consolationDraw],
  } = drawStructures({ drawDefinition, stage: CONSOLATION });
  const consolationMatchUps = consolationDraw && consolationDraw.matchUps;
  return { links, mainDrawMatchUps, consolationMatchUps };
}
