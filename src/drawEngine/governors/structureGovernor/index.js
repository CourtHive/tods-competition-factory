import { generateDrawType } from './generateDrawType';
import { getDrawStructures, getStructureQualifiersCount } from 'competitionFactory/drawEngine/getters/structureGetter';
import { buildDrawHierarchy } from 'competitionFactory/drawEngine/generators/drawHierarchy';

const structureGovernor = {
  getDrawStructures,
  generateDrawType,
  getStructureQualifiersCount,

  buildDrawHierarchy,
}
 
export default structureGovernor;
