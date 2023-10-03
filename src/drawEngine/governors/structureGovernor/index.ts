import { addVoluntaryConsolationStructure } from '../../generators/addVoluntaryConsolationStructure';
import { generateDrawTypeAndModifyDrawDefinition } from './generateDrawTypeAndModifyDrawDefinition';
import { generateAndPopulatePlayoffStructures } from './generateAndPopulatePlayoffStructures';
import { generateDrawStructuresAndLinks } from './generateDrawStructuresAndLinks';
import { addVoluntaryConsolationStage } from './addVoluntaryConsolationStage';
import { generateVoluntaryConsolation } from './generateVoluntaryConsolation';
import { generateQualifyingStructure } from './generateQualifyingStructure';
import { getAvailablePlayoffProfiles } from './getAvailablePlayoffProfiles';
import { attachQualifyingStructure } from './attachQualifyingStructure';
import { getQualifiersCount } from '../../getters/getQualifiersCount';
import { buildDrawHierarchy } from '../../generators/drawHierarchy';
import { addQualifyingStructure } from './addQualifyingStructure';
import { getPositionsPlayedOff } from './getPositionsPlayedOff';
import { getDrawStructures } from '../../getters/findStructure';
import { addPlayoffStructures } from './addPlayoffStructures';
import { attachPlayoffStructures } from './attachStructures';
import { deleteAdHocMatchUps } from './deleteAdHocMatchUps';
import { setStructureOrder } from './setStructureOrder';
import { renameStructures } from './renameStructures';
import { removeStructure } from './removeStructure';
import { getSourceRounds } from './getSourceRounds';
import {
  addAdHocMatchUps,
  generateAdHocMatchUps,
} from '../../generators/generateAdHocMatchUps';

const structureGovernor = {
  generateAndPopulatePlayoffStructures,
  attachPlayoffStructures,
  addPlayoffStructures,
  setStructureOrder,
  renameStructures,

  generateQualifyingStructure,
  attachQualifyingStructure,
  addQualifyingStructure,

  getAvailablePlayoffRounds: getAvailablePlayoffProfiles, // to be deprecated,
  getAvailablePlayoffProfiles,
  getSourceRounds,
  getDrawStructures,
  getPositionsPlayedOff,
  getQualifiersCount,
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
