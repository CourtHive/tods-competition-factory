import { getDrawDefinition, drawEngine } from 'src/drawEngine';
import { reset, initialize, mainDrawPositions } from './primitives';
import { drawStructures } from 'src/drawEngine/getters/structureGetter';

import {
  MAIN, CONSOLATION
} from 'src/constants/drawDefinitionConstants';

export function feedInChampionship({drawSize, drawType}) {
  reset();
  initialize();
  mainDrawPositions({drawSize});
  const { links } = drawEngine.generateDrawType({drawType});
  const { drawDefinition } = getDrawDefinition();
  const { structures: [mainDraw]} = drawStructures({drawDefinition, stage: MAIN});
  const mainDrawMatchUps = mainDraw && mainDraw.matchUps;
  const { structures: [consolationDraw]} = drawStructures({drawDefinition, stage: CONSOLATION});
  const consolationMatchUps = consolationDraw && consolationDraw.matchUps;
  return { links, mainDrawMatchUps, consolationMatchUps };
}

