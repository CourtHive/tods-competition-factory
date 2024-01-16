import { generateDrawTypeAndModifyDrawDefinition } from 'assemblies/generators/drawDefinitions/generateDrawTypeAndModifyDrawDefinition';
import { generateAndPopulatePlayoffStructures } from 'assemblies/generators/drawDefinitions/generateAndPopulatePlayoffStructures';
import { generateVoluntaryConsolation } from 'assemblies/generators/drawDefinitions/drawTypes/generateVoluntaryConsolation';
import { generateQualifyingStructure } from 'assemblies/generators/drawDefinitions/drawTypes/generateQualifyingStructure';
import { generateDrawStructuresAndLinks } from 'assemblies/generators/drawDefinitions/generateDrawStructuresAndLinks';
import { generateDrawMaticRound } from 'assemblies/generators/drawDefinitions/drawMatic/generateDrawMaticRound';
import { generateSeedingScaleItems } from 'assemblies/generators/drawDefinitions/generateSeedingScaleItems';
import { generateDrawDefinition } from 'assemblies/generators/drawDefinitions/generateDrawDefinition';
import { generateAdHocMatchUps } from 'assemblies/generators/drawDefinitions/generateAdHocMatchUps';
import { generateFlightProfile } from 'assemblies/generators/drawDefinitions/generateFlightProfile';
import { generateLineUps } from 'assemblies/generators/participants/generateLineUps';
import { drawMatic } from 'assemblies/generators/drawDefinitions/drawMatic/drawMatic';
import { generateCourts } from 'assemblies/generators/venues/generateCourts';
import garman from 'assemblies/generators/scheduling/garman/garman';

export const generationGovernor = {
  drawMatic,
  garman,
  generateAdHocMatchUps,
  generateAndPopulatePlayoffStructures,
  generateCourts,
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
