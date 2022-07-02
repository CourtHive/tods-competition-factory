import { generateTieMatchUpScore } from '../../../drawEngine/generators/generateTieMatchUpScore';
import { tallyParticipantResults } from '../../getters/roundRobinTally/roundRobinTally';
import { validateTieFormat } from '../tieFormatGovernor/tieFormatUtilities';
import { getSetComplement, getTiebreakComplement } from './getComplement';
import { checkSetIsComplete, keyValueScore } from './keyValueScore';
import { generateScoreString } from './generateScoreString';
import { analyzeMatchUp } from './analyzeMatchUp';
import { analyzeSet } from './analyzeSet';

import { orderCollectionDefinitions } from '../tieFormatGovernor/orderCollectionDefinitions';
import { removeCollectionDefinition } from '../tieFormatGovernor/removeCollectionDefinition';
import { modifyCollectionDefinition } from '../tieFormatGovernor/modifyCollectionDefinition';
import { addCollectionDefinition } from '../tieFormatGovernor/addCollectionDefinition';
import { scoreHasValue } from './scoreHasValue';

import { removeCollectionGroup } from '../tieFormatGovernor/removeCollectionGroup';
import { addCollectionGroup } from '../tieFormatGovernor/addCollectionGroup';

import { stringify } from '../matchUpFormatGovernor/stringify';
import { isValid } from '../matchUpFormatGovernor/isValid';
import { parse } from '../matchUpFormatGovernor/parse';

export const scoreGovernor = {
  stringifyMatchUpFormat: stringify,
  isValidMatchUpFormat: isValid,
  modifyCollectionDefinition,
  orderCollectionDefinitions,
  removeCollectionDefinition,
  parseMatchUpFormat: parse,
  generateTieMatchUpScore,
  tallyParticipantResults,
  addCollectionDefinition,
  removeCollectionGroup,
  getTiebreakComplement,
  generateScoreString,
  addCollectionGroup,
  checkSetIsComplete,
  validateTieFormat,
  getSetComplement,
  analyzeMatchUp,
  keyValueScore,
  scoreHasValue,
  analyzeSet,
};

export default scoreGovernor;
