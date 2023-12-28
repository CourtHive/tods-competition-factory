import { generateDrawTypeAndModifyDrawDefinition } from '../../../assemblies/generators/drawDefinitions/generateDrawTypeAndModifyDrawDefinition';
import { generateAndPopulatePlayoffStructures } from '../../../assemblies/generators/drawDefinitions/generateAndPopulatePlayoffStructures';
import { generateVoluntaryConsolation } from '../../../assemblies/generators/drawDefinitions/drawTypes/generateVoluntaryConsolation';
import { generateDrawStructuresAndLinks } from '../../../assemblies/generators/drawDefinitions/generateDrawStructuresAndLinks';
import { generateDrawMaticRound } from '../../../assemblies/generators/drawDefinitions/drawMatic/generateDrawMaticRound';
import { generateSeedingScaleItems } from '../../../assemblies/generators/drawDefinitions/generateSeedingScaleItems';
import { generateQualifyingStructure } from '../../generators/drawDefinitions/drawTypes/generateQualifyingStructure';
import { generateDrawDefinition } from '../../../assemblies/generators/drawDefinitions/generateDrawDefinition';
import { generateAdHocMatchUps } from '../../../assemblies/generators/drawDefinitions/generateAdHocMatchUps';
import { generateFlightProfile } from '../../../assemblies/generators/drawDefinitions/generateFlightProfile';
import { generateLineUps } from '../../generators/participants/generateLineUps';

const generationGovernor = {
  generateAdHocMatchUps,
  generateAndPopulatePlayoffStructures,
  generateDrawDefinition,
  generateDrawMaticRound,
  generateDrawStructuresAndLinks,
  generateDrawTypeAndModifyDrawDefinition,
  generateFlightProfile,
  generateLineUps,
  generateQualifyingStructure,
  generateSeedingScaleItems,
  generateVoluntaryConsolation,
};

export default generationGovernor;
