import { definedAttributes } from '../../../utilities/definedAttributes';
import { attributeFilter } from '../../../utilities/attributeFilter';
import { generateTimeCode } from '../../../utilities/timeCode';
import { makeDeepCopy } from '../../../utilities/makeDeepCopy';
import { numericSort } from '../../../utilities/sorting';
import { UUID, UUIDS } from '../../../utilities/UUID';
import { JSON2CSV, flattenJSON } from '../../../utilities/json';
import {
  nearestPowerOf2,
  nextPowerOf2,
  isPowerOf2,
  isOdd,
  isConvertableInteger,
  isNumeric,
} from '../../../utilities/math';
import {
  extractAttributes,
  hasAttributeValues,
  createMap,
  generateHashCode,
  undefinedToNull,
} from '../../../utilities/objects';

import {
  allNumeric,
  chunkArray,
  chunkByNth,
  chunkSizeProfile,
  countValues,
  generateRange,
  groupValues,
  instanceCount,
  intersection,
  noNulls,
  noNumeric,
  overlap,
  occurrences,
  randomMember,
  randomPop,
  shuffleArray,
  subSort,
  unique,
} from '../../../utilities/arrays';

import { getValidGroupSizes } from '../../../assemblies/generators/drawDefinitions/drawTypes/roundRobin/roundRobin';
import { visualizeScheduledMatchUps } from '../../../global/testHarness/testUtilities/visualizeScheduledMatchUps';
import { tieFormatGenderValidityCheck } from '../../../global/functions/deducers/tieFormatGenderValidityCheck';
import { roundRobinGroups } from '../../generators/drawDefinitions/drawTypes/roundRobin/roundRobinGroups';
import { getSeedingThresholds } from '../../../mutate/drawDefinitions/positionGovernor/getSeedBlocks';
import { compareTieFormats } from '../../../query/hierarchical/tieFormats/compareTieFormats';
import { categoryCanContain } from '../../../global/functions/deducers/categoryCanContain';
import { getCategoryAgeDetails } from '../../../global/functions/getCategoryAgeDetails';
import { calculateWinCriteria } from '../../../query/matchUp/calculateWinCriteria';
import { getMatchUpContextIds } from '../../../query/matchUp/getMatchUpContextIds';
import { getScaleValues } from '../../../query/participant/getScaleValues';
import { dehydrateMatchUps } from '../../../mutate/tournaments/dehydrate';
import { structureSort } from '../../../functions/sorters/structureSort';
import { validateCategory } from '../../../validators/validateCategory';
import { matchUpSort } from '../../../functions/sorters/matchUpSort';
import { dateRange, dateTime } from '../../../utilities/dateTime';
import { isAdHoc } from '../../../query/drawDefinition/isAdHoc';
import { constantToString } from '../../../utilities/strings';
import { getTimeItem } from '../../../query/base/timeItems';
import garman from '../../../forge/garman/garman';
import {
  allPlayoffPositionsFilled,
  isCompletedStructure,
} from '../../../query/drawDefinition/structureActions';

const utilitiesGovernor = {
  allNumeric,
  attributeFilter,
  chunkArray,
  chunkByNth,
  chunkSizeProfile,
  countValues,
  createMap,
  definedAttributes,
  extractAttributes,
  generateHashCode,
  generateRange,
  generateTimeCode,
  groupValues,
  hasAttributeValues,
  instanceCount,
  intersection,
  isOdd,
  isPowerOf2,
  JSON2CSV,
  makeDeepCopy,
  nearestPowerOf2,
  nextPowerOf2,
  noNulls,
  noNumeric,
  numericSort,
  occurrences,
  overlap,
  randomMember,
  randomPop,
  shuffleArray,
  subSort,
  undefinedToNull,
  unique,
  UUID,
  UUIDS,

  roundRobinGroups,
  allPlayoffPositionsFilled,
  calculateWinCriteria,
  categoryCanContain,
  compareTieFormats,
  constantToString,

  dateRange,
  dateTime,
  dehydrateMatchUps,
  flattenJSON,

  garman, // scheduleGovernor?

  tieFormatGenderValidityCheck,
  getCategoryAgeDetails,
  getMatchUpContextIds,
  getScaleValues,
  getSeedingThresholds,
  getTimeItem,
  getValidGroupSizes,

  isAdHoc,
  isConvertableInteger,
  isNumeric,
  isCompletedStructure,
  matchUpSort,
  structureSort,
  validateCategory,
  visualizeScheduledMatchUps,
};

export const utilities = utilitiesGovernor;
export default utilitiesGovernor;
