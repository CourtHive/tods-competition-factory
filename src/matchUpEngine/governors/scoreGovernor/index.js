import { generateTieMatchUpScore } from '../../../drawEngine/generators/generateTieMatchUpScore';
import { tallyParticipantResults } from './roundRobinTally/roundRobinTally';
import { getSetComplement, getTiebreakComplement } from './getComplement';
import { validateTieFormat } from './tieFormats/tieFormatUtilities';
import { checkSetIsComplete, keyValueScore } from './keyValueScore';
import { generateScoreString } from './generateScoreString';
import { analyzeMatchUp } from './analyzeMatchUp';
import { analyzeSet } from './analyzeSet';

import { orderCollectionDefinitions } from './tieFormats/orderCollectionDefinitions';
import { removeCollectionDefinition } from './tieFormats/removeCollectionDefinition';
import { modifyCollectionDefinition } from './tieFormats/modifyCollectionDefinition';
import { addCollectionDefinition } from './tieFormats/addCollectionDefinition';
import { scoreHasValue } from './scoreHasValue';

import { removeCollectionGroup } from './tieFormats/removeCollectionGroup';
import { addCollectionGroup } from './tieFormats/addCollectionGroup';

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
