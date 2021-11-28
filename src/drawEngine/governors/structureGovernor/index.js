import { generateAndPopulatePlayoffStructures } from './generateAndPopulatePlayoffStructures';
import { generateVoluntaryConsolationStructure } from '../../generators/voluntaryConsolation';
import { generateQualifyingLink } from '../../generators/generateQualifyingLink';
import { generateAdHocMatchUps } from '../../generators/generateAdHocMatchUps';
import { addVoluntaryConsolationStage } from './addVoluntaryConsolationStage';
import { getStructureQualifiersCount } from '../../getters/structureGetter';
import { getAvailablePlayoffRounds } from './getAvailablePlayoffRounds';
import { attachPlayoffStructures } from './attachPlayoffStructures';
import { buildDrawHierarchy } from '../../generators/drawHierarchy';
import { getPositionsPlayedOff } from './getPositionsPlayedOff';
import { getDrawStructures } from '../../getters/findStructure';
import { structureSort } from '../../getters/structureSort';
import { deleteAdHocMatchUps } from './deleteAdHocMatchUps';
import { generateDrawType } from './generateDrawType';
import { removeStructure } from './removeStructure';
import { getSourceRounds } from './getSourceRounds';

import { newAddPlayoffStructures as addPlayoffStructures } from './newAddPlayoffStructures';

const structureGovernor = {
  generateAndPopulatePlayoffStructures,
  attachPlayoffStructures,

  getSourceRounds,
  getDrawStructures,
  getPositionsPlayedOff,
  getStructureQualifiersCount,
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
