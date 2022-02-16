import { generateAndPopulatePlayoffStructures } from './generateAndPopulatePlayoffStructures';
import { generateVoluntaryConsolationStructure } from '../../generators/voluntaryConsolation';
import { generateQualifyingLink } from '../../generators/generateQualifyingLink';
import { generateAdHocMatchUps } from '../../generators/generateAdHocMatchUps';
import { addVoluntaryConsolationStage } from './addVoluntaryConsolationStage';
import { getQualifiersCount } from '../../getters/structureGetter';
import { getAvailablePlayoffRounds } from './getAvailablePlayoffRounds';
import { attachPlayoffStructures } from './attachPlayoffStructures';
import { buildDrawHierarchy } from '../../generators/drawHierarchy';
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

  getSourceRounds,
  getDrawStructures,
  getPositionsPlayedOff,
  getQualifiersCount,
  getAvailablePlayoffRounds,
  addPlayoffStructures,
  removeStructure,

  generateQualifyingLink,
  generateAdHocMatchUps,
  deleteAdHocMatchUps,

  structureSort,
  generateDrawType,
  addVoluntaryConsolationStage,
  generateVoluntaryConsolationStructure,

  buildDrawHierarchy, // obsolete
};

export default structureGovernor;
