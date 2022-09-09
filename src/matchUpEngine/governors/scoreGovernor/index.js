import { generateTieMatchUpScore } from '../../../drawEngine/generators/generateTieMatchUpScore';
import { validateTieFormat } from '../tieFormatGovernor/tieFormatUtilities';
import { generateScoreString } from '../../generators/generateScoreString';
import { checkSetIsComplete, keyValueScore } from './keyValueScore';
import { scoreHasValue } from '../queryGovernor/scoreHasValue';
import { analyzeSet } from '../../getters/analyzeSet';
import {
  getSetComplement,
  getTiebreakComplement,
} from '../../getters/getComplement';

// renamed
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
