import { addVoluntaryConsolationStructure } from '../../generators/addVoluntaryConsolationStructure';
import { generateAndPopulatePlayoffStructures } from './generateAndPopulatePlayoffStructures';
import { generateAdHocMatchUps } from '../../generators/generateAdHocMatchUps';
import { addVoluntaryConsolationStage } from './addVoluntaryConsolationStage';
import { generateVoluntaryConsolation } from './generateVoluntaryConsolation';
import { generateQualifyingStructure } from './generateQualifyingStructure';
import { attachQualifyingStructure } from './attachQualifyingStructure';
import { getAvailablePlayoffRounds } from './getAvailablePlayoffRounds';
import { getQualifiersCount } from '../../getters/getQualifiersCount';
import { attachPlayoffStructures } from './attachPlayoffStructures';
import { buildDrawHierarchy } from '../../generators/drawHierarchy';
import { addQualifyingStructure } from './addQualifyingStructure';
import { getPositionsPlayedOff } from './getPositionsPlayedOff';
import { getDrawStructures } from '../../getters/findStructure';
import { addPlayoffStructures } from './addPlayoffStructures';
import { structureSort } from '../../getters/structureSort';
import { deleteAdHocMatchUps } from './deleteAdHocMatchUps';
import { generateDrawType } from './generateDrawType';
import { removeStructure } from './removeStructure';
import { getSourceRounds } from './getSourceRounds';

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

  structureSort,
  generateDrawType,
  addVoluntaryConsolationStage,
  addVoluntaryConsolationStructure,
  generateVoluntaryConsolation,

  buildDrawHierarchy, // obsolete
};

export default structureGovernor;
