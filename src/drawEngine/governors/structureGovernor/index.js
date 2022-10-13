import { addVoluntaryConsolationStructure } from '../../generators/addVoluntaryConsolationStructure';
import { generateAndPopulatePlayoffStructures } from './generateAndPopulatePlayoffStructures';
import { addVoluntaryConsolationStage } from './addVoluntaryConsolationStage';
import { generateVoluntaryConsolation } from './generateVoluntaryConsolation';
import { generateQualifyingStructure } from './generateQualifyingStructure';
import { attachQualifyingStructure } from './attachQualifyingStructure';
import { getAvailablePlayoffRounds } from './getAvailablePlayoffRounds';
import { getQualifiersCount } from '../../getters/getQualifiersCount';
import { buildDrawHierarchy } from '../../generators/drawHierarchy';
import { addQualifyingStructure } from './addQualifyingStructure';
import { getPositionsPlayedOff } from './getPositionsPlayedOff';
import { getDrawStructures } from '../../getters/findStructure';
import { addPlayoffStructures } from './addPlayoffStructures';
import { attachPlayoffStructures } from './attachStructures';
import { deleteAdHocMatchUps } from './deleteAdHocMatchUps';
import { removeStructure } from './removeStructure';
import { getSourceRounds } from './getSourceRounds';
import {
  addAdHocMatchUps,
  generateAdHocMatchUps,
} from '../../generators/generateAdHocMatchUps';

import { generateDrawStructuresAndLinks } from './generateDrawStructuresAndLinks';
import { generateDrawTypeAndModifyDrawDefinition } from './generateDrawTypeAndModifyDrawDefinition';

const structureGovernor = {
  generateAndPopulatePlayoffStructures,
  attachPlayoffStructures,
  addPlayoffStructures,

  generateQualifyingStructure,
  attachQualifyingStructure,
  addQualifyingStructure,

  getSourceRounds,
  getDrawStructures,
  getPositionsPlayedOff,
  getQualifiersCount,
  getAvailablePlayoffRounds,
  removeStructure,

  generateAdHocMatchUps,
  deleteAdHocMatchUps,
  addAdHocMatchUps,

  addVoluntaryConsolationStage,
  addVoluntaryConsolationStructure,
  generateVoluntaryConsolation,

  buildDrawHierarchy, // obsolete

  generateDrawTypeAndModifyDrawDefinition,
  generateDrawStructuresAndLinks,
};

export default structureGovernor;
