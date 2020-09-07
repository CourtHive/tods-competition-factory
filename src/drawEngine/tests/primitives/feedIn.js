import { getDrawDefinition, drawEngine } from 'competitionFactory/drawEngine';
import { reset, initialize, mainDrawPositions } from './primitives';
import { drawStructures } from 'competitionFactory/drawEngine/getters/structureGetter';

import {
  MAIN, CONSOLATION
} from 'competitionFactory/constants/drawDefinitionConstants';

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

