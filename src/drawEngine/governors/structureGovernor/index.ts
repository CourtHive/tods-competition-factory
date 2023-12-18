import { addVoluntaryConsolationStructure } from '../../../mutate/drawDefinitions/addVoluntaryConsolationStructure';
import { generateDrawTypeAndModifyDrawDefinition } from '../../../assemblies/generators/drawDefinitions/generateDrawTypeAndModifyDrawDefinition';
import { generateAndPopulatePlayoffStructures } from '../../../assemblies/generators/drawDefinitions/generateAndPopulatePlayoffStructures';
import { generateDrawStructuresAndLinks } from '../../../assemblies/generators/drawDefinitions/generateDrawStructuresAndLinks';
import { addVoluntaryConsolationStage } from '../../../mutate/drawDefinitions/addVoluntaryConsolationStage';
import { generateVoluntaryConsolation } from '../../../assemblies/generators/drawDefinitions/generateVoluntaryConsolation';
import { generateQualifyingStructure } from '../../../assemblies/generators/drawDefinitions/generateQualifyingStructure';
import { getAvailablePlayoffProfiles } from './getAvailablePlayoffProfiles';
import { attachQualifyingStructure } from '../../../mutate/drawDefinitions/attachQualifyingStructure';
import { getQualifiersCount } from '../../getters/getQualifiersCount';
import { buildDrawHierarchy } from '../../generators/drawHierarchy';
import { addQualifyingStructure } from '../../../mutate/drawDefinitions/addQualifyingStructure';
import { getPositionsPlayedOff } from './getPositionsPlayedOff';
import { getDrawStructures } from '../../getters/findStructure';
import { addPlayoffStructures } from '../../../mutate/drawDefinitions/addPlayoffStructures';
import { attachPlayoffStructures } from '../../../mutate/drawDefinitions/attachStructures';
import { deleteAdHocMatchUps } from '../../../mutate/structures/deleteAdHocMatchUps';
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
