import { generateVoluntaryConsolationStructure } from '../../generators/voluntaryConsolation';
import { generateAdHocMatchUps } from '../../generators/generateAdHocMatchUps';
import { addVoluntaryConsolationStage } from './addVoluntaryConsolationStage';
import { getAvailablePlayoffRounds } from './getAvailablePlayoffRounds';
import { buildDrawHierarchy } from '../../generators/drawHierarchy';
import { getPositionsPlayedOff } from './getPositionsPlayedOff';
import { addPlayoffStructures } from './addPlayoffStructures';
import { structureSort } from '../../getters/structureSort';
import { generateDrawType } from './generateDrawType';
import { addAdHocMatchUps } from './addAdHocMatchUps';
import { removeStructure } from './removeStructure';
import { getSourceRounds } from './getSourceRounds';

import {
  getDrawStructures,
  getStructureQualifiersCount,
} from '../../getters/structureGetter';

const structureGovernor = {
  getSourceRounds,
  getDrawStructures,
  getPositionsPlayedOff,
  getStructureQualifiersCount,
  getAvailablePlayoffRounds,
  addPlayoffStructures,
  removeStructure,

  addAdHocMatchUps,
  generateAdHocMatchUps,

  structureSort,
  generateDrawType,
  addVoluntaryConsolationStage,
  generateVoluntaryConsolationStructure,

  buildDrawHierarchy, // obsolete
};

export default structureGovernor;
