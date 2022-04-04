import { generateTieMatchUpScore } from '../../generators/generateTieMatchUpScore';
import { tallyParticipantResults } from './roundRobinTally/roundRobinTally';
import { getSetComplement, getTiebreakComplement } from './getComplement';
import { validateTieFormat } from './tieFormats/tieFormatUtilities';
import { checkSetIsComplete, keyValueScore } from './keyValueScore';
import { generateScoreString } from './generateScoreString';
import { stringify } from './matchUpFormatCode/stringify';
import { isValid } from './matchUpFormatCode/isValid';
import { analyzeMatchUp } from './analyzeMatchUp';
import { parse } from './matchUpFormatCode/parse';
import { analyzeSet } from './analyzeSet';

import { removeCollectionDefinition } from './tieFormats/removeCollectionDefinition';
import { modifyCollectionDefinition } from './tieFormats/modifyCollectionDefinition';
import { addCollectionDefinition } from './tieFormats/addCollectionDefinition';
import { scoreHasValue } from './scoreHasValue';

export const scoreGovernor = {
  stringifyMatchUpFormat: stringify,
  isValidMatchUpFormat: isValid,
  removeCollectionDefinition,
  modifyCollectionDefinition,
  parseMatchUpFormat: parse,
  generateTieMatchUpScore,
  tallyParticipantResults,
  addCollectionDefinition,
  getTiebreakComplement,
  generateScoreString,
  checkSetIsComplete,
  validateTieFormat,
  getSetComplement,
  analyzeMatchUp,
  keyValueScore,
  scoreHasValue,
  analyzeSet,
};

export default scoreGovernor;
