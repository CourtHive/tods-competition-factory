import { getValidGroupSizes } from '../../../assemblies/generators/drawDefinitions/drawTypes/roundRobin/roundRobin';
import { visualizeScheduledMatchUps } from '../../../tests/testHarness/testUtilities/visualizeScheduledMatchUps';
import { tieFormatGenderValidityCheck } from '../../../validators/tieFormatGenderValidityCheck';
import { roundRobinGroups } from '../../generators/drawDefinitions/drawTypes/roundRobin/roundRobinGroups';
import { getSeedingThresholds } from '../../../mutate/drawDefinitions/positionGovernor/getSeedBlocks';
import { compareTieFormats } from '../../../query/hierarchical/tieFormats/compareTieFormats';
import { getCategoryAgeDetails } from '../../../query/event/getCategoryAgeDetails';
import { calculateWinCriteria } from '../../../query/matchUp/calculateWinCriteria';
import { getMatchUpContextIds } from '../../../query/matchUp/getMatchUpContextIds';
import { getScaleValues } from '../../../query/participant/getScaleValues';
import { dehydrateMatchUps } from '../../../mutate/tournaments/dehydrate';
import { structureSort } from '../../../functions/sorters/structureSort';
import { validateCategory } from '../../../validators/validateCategory';
import { definedAttributes } from '../../../utilities/definedAttributes';
import { attributeFilter } from '../../../utilities/attributeFilter';
import { matchUpSort } from '../../../functions/sorters/matchUpSort';
import { dateRange, dateTime } from '../../../utilities/dateTime';
import { JSON2CSV, flattenJSON } from '../../../utilities/json';
import { generateTimeCode } from '../../../utilities/timeCode';
import { makeDeepCopy } from '../../../utilities/makeDeepCopy';
import { isAdHoc } from '../../../query/drawDefinition/isAdHoc';
import { constantToString } from '../../../utilities/strings';
import { getTimeItem } from '../../../query/base/timeItems';
import { numericSort } from '../../../utilities/sorting';
import { UUID, UUIDS } from '../../../utilities/UUID';
import {
  allPlayoffPositionsFilled,
  isCompletedStructure,
} from '../../../query/drawDefinition/structureActions';
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

const utilitiesGovernor = {
  allNumeric,
  allPlayoffPositionsFilled,
  attributeFilter,
  calculateWinCriteria,
  chunkArray,
  chunkByNth,
  chunkSizeProfile,
  compareTieFormats,
  constantToString,
  countValues,
  createMap,
  dateRange,
  dateTime,
  definedAttributes,
  dehydrateMatchUps,
  extractAttributes,
  flattenJSON,
  generateHashCode,
  generateRange,
  generateTimeCode,
  getCategoryAgeDetails,
  getMatchUpContextIds,
  getScaleValues,
  getSeedingThresholds,
  getTimeItem,
  getValidGroupSizes,
  groupValues,
  hasAttributeValues,
  instanceCount,
  intersection,
  isAdHoc,
  isCompletedStructure,
  isConvertableInteger,
  isNumeric,
  isOdd,
  isPowerOf2,
  JSON2CSV,
  makeDeepCopy,
  matchUpSort,
  nearestPowerOf2,
  nextPowerOf2,
  noNulls,
  noNumeric,
  numericSort,
  occurrences,
  overlap,
  randomMember,
  randomPop,
  roundRobinGroups,
  shuffleArray,
  structureSort,
  subSort,
  tieFormatGenderValidityCheck,
  undefinedToNull,
  unique,
  UUID,
  UUIDS,
  validateCategory,
  visualizeScheduledMatchUps,
};

export const utilities = utilitiesGovernor;
export default utilitiesGovernor;
