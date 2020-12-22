import { generateDrawType } from './generateDrawType';
import { getSourceRounds } from './getSourceRounds';
import { getPositionsPlayedOff } from './getPositionsPlayedOff';
import { getAvailablePlayoffRounds } from './getAvailablePlayoffRounds';
import { buildDrawHierarchy } from '../../generators/drawHierarchy';
import { addPlayoffStructures } from './addPlayoffStructures';

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

  generateDrawType,

  buildDrawHierarchy,
};

export default structureGovernor;
