import { generateDrawType } from './generateDrawType';
import {
  getDrawStructures,
  getStructureQualifiersCount,
} from '../../getters/structureGetter';
import { buildDrawHierarchy } from '../../generators/drawHierarchy';

const structureGovernor = {
  getDrawStructures,
  generateDrawType,
  getStructureQualifiersCount,

  buildDrawHierarchy,
};

export default structureGovernor;
