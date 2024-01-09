import { visualizeScheduledMatchUps } from '../../../tests/testHarness/testUtilities/visualizeScheduledMatchUps';
import { dehydrateMatchUps } from '../../../mutate/tournaments/dehydrate';
import { structureSort } from '../../../functions/sorters/structureSort';

import { definedAttributes } from '../../../utilities/definedAttributes';
import { attributeFilter } from '../../../utilities/attributeFilter';
import { matchUpSort } from '../../../functions/sorters/matchUpSort';
import { generateDateRange, dateTime } from '../../../utilities/dateTime';
import { JSON2CSV, flattenJSON } from '../../../utilities/json';
import { generateTimeCode } from '../../../utilities/timeCode';
import { makeDeepCopy } from '../../../utilities/makeDeepCopy';
import { constantToString } from '../../../utilities/strings';
import { numericSort } from '../../../utilities/sorting';
import { UUID, UUIDS } from '../../../utilities/UUID';
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

export const utilitiesGovernor = {
  visualizeScheduledMatchUps,
  dehydrateMatchUps,
  structureSort,

  allNumeric,
  attributeFilter,
  chunkArray,
  chunkByNth,
  chunkSizeProfile,
  constantToString,
  countValues,
  createMap,
  dateTime,
  definedAttributes,
  extractAttributes,
  flattenJSON,
  generateDateRange,
  generateHashCode,
  generateRange,
  generateTimeCode,
  groupValues,
  hasAttributeValues,
  instanceCount,
  intersection,
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
  shuffleArray,
  subSort,
  undefinedToNull,
  unique,
  UUID,
  UUIDS,
};

export const utilities = utilitiesGovernor;
export default utilitiesGovernor;
