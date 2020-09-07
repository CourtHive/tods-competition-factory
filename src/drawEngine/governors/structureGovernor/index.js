import { generateDrawType } from './generateDrawType';
import { getDrawStructures, getStructureQualifiersCount } from 'src/drawEngine/getters/structureGetter';
import { buildDrawHierarchy } from 'src/drawEngine/generators/drawHierarchy';

const structureGovernor = {
  getDrawStructures,
  generateDrawType,
  getStructureQualifiersCount,

  buildDrawHierarchy,
}
 
export default structureGovernor;
