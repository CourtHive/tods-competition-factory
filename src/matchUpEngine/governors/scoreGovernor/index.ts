import { generateTieMatchUpScore } from '../../../assemblies/generators/tieMatchUpScore/generateTieMatchUpScore';
import { updateTieMatchUpScore } from '../../../drawEngine/governors/matchUpGovernor/tieMatchUpScore';
import { validateTieFormat } from '../tieFormatGovernor/tieFormatUtilities';
import { generateScoreString } from '../../generators/generateScoreString';
import { validateScore } from '../../../validators/validateScore';
import { checkSetIsComplete, keyValueScore } from './keyValueScore';
import { checkScoreHasValue } from '../../../query/matchUp/checkScoreHasValue';
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
  checkScoreHasValue,
  keyValueScore,
  validateScore,
  reverseScore,
  analyzeSet,
};

export default scoreGovernor;
