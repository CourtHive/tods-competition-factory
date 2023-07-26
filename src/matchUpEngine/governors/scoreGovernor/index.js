import { updateTieMatchUpScore } from '../../../drawEngine/governors/matchUpGovernor/tieMatchUpScore';
import { generateTieMatchUpScore } from '../../../drawEngine/generators/tieMatchUpScore/generateTieMatchUpScore';
import { validateTieFormat } from '../tieFormatGovernor/tieFormatUtilities';
import { generateScoreString } from '../../generators/generateScoreString';
import { validateScore } from '../../../global/validation/validateScore';
import { checkSetIsComplete, keyValueScore } from './keyValueScore';
import { scoreHasValue } from '../queryGovernor/scoreHasValue';
import { analyzeSet } from '../../getters/analyzeSet';
import { reverseScore } from './reverseScore';
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
  updateTieMatchUpScore,
  generateScoreString,
  checkSetIsComplete,
  validateTieFormat,
  getSetComplement,
  scoreHasValue,
  keyValueScore,
  validateScore,
  reverseScore,
  analyzeSet,
};

export default scoreGovernor;
