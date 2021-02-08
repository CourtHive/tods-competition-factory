import { getAvailablePlayoffRounds } from './getAvailablePlayoffRounds';
import { buildDrawHierarchy } from '../../generators/drawHierarchy';
import { getPositionsPlayedOff } from './getPositionsPlayedOff';
import { addPlayoffStructures } from './addPlayoffStructures';
import { structureSort } from '../../getters/structureSort';
import { generateDrawType } from './generateDrawType';
import { getSourceRounds } from './getSourceRounds';

import {
  getDrawStructures,
  getStructureQualifiersCount,
} from '../../getters/structureGetter';

const structureGovernor = {
  getSourceRounds,
  getDrawStructures,
  getPositionsPlayedOff,
  getStructureQualifiersCount,
  getAvailablePlayoffRounds,
  addPlayoffStructures,

  structureSort,
  generateDrawType,

  buildDrawHierarchy,
};

export default structureGovernor;
