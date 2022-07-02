import { generateTieMatchUpScore } from '../../../drawEngine/generators/generateTieMatchUpScore';
import { validateTieFormat } from '../tieFormatGovernor/tieFormatUtilities';
import { getSetComplement, getTiebreakComplement } from './getComplement';
import { checkSetIsComplete, keyValueScore } from './keyValueScore';
import { generateScoreString } from './generateScoreString';
import { analyzeSet } from './analyzeSet';

import { scoreHasValue } from './scoreHasValue';

import { stringify } from '../matchUpFormatGovernor/stringify';
import { isValid } from '../matchUpFormatGovernor/isValid';
import { parse } from '../matchUpFormatGovernor/parse';

export const scoreGovernor = {
  stringifyMatchUpFormat: stringify,
  isValidMatchUpFormat: isValid,
  parseMatchUpFormat: parse,
  generateTieMatchUpScore,
  getTiebreakComplement,
  generateScoreString,
  checkSetIsComplete,
  validateTieFormat,
  getSetComplement,
  keyValueScore,
  scoreHasValue,
  analyzeSet,
};

export default scoreGovernor;
