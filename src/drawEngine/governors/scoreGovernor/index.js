import { analyzeSet } from './analyzeSet';
import { analyzeMatchUp } from './analyzeMatchUp';
import { tallyBracket } from './roundRobinTally';
import {
  keyValueScore,
  keyValueConstants,
  checkSetIsComplete,
} from './keyValueScore';
import { generateScoreString } from './generateScoreString';
import { getSetComplement, getTiebreakComplement } from './getComplement';

export const scoreGovernor = {
  analyzeSet,
  tallyBracket,
  keyValueScore,
  analyzeMatchUp,
  getSetComplement,
  keyValueConstants,
  checkSetIsComplete,
  generateScoreString,
  getTiebreakComplement,
};

export default scoreGovernor;
