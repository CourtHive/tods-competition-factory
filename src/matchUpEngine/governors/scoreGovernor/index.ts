import { generateTieMatchUpScore } from '../../../assemblies/generators/tieMatchUpScore/generateTieMatchUpScore';
import { isValidMatchUpFormat } from '../../../validators/isValidMatchUpFormat';
import { updateTieMatchUpScore } from '../../../mutate/matchUps/score/tieMatchUpScore';
import { validateTieFormat } from '../../../validators/validateTieFormat';
import { generateScoreString } from '../../../assemblies/generators/matchUps/generateScoreString';
import { validateScore } from '../../../validators/validateScore';
import { checkSetIsComplete, keyValueScore } from './keyValueScore';
import { checkScoreHasValue } from '../../../query/matchUp/checkScoreHasValue';
import { analyzeSet } from '../../../query/matchUp/analyzeSet';
import { reverseScore } from './reverseScore';
import {
  getSetComplement,
  getTiebreakComplement,
} from '../../../query/matchUp/getComplement';

// renamed
import { stringify } from '../matchUpFormatGovernor/stringify';
import { parse } from '../matchUpFormatGovernor/parse';

export const scoreGovernor = {
  stringifyMatchUpFormat: stringify,
  isValidMatchUpFormat,
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
