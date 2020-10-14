import { analyzeSet } from './analyzeSet';
import { analyzeMatchUp } from './analyzeMatchUp';
import { tallyBracket } from './roundRobinTally';
import { keyValueScore } from './keyValueScore';
import { generateScoreString } from './generateScoreString';
import { getSetComplement, getTiebreakComplement } from './getComplement';

export const scoreGovernor = {
  analyzeSet,
  tallyBracket,
  keyValueScore,
  analyzeMatchUp,
  getSetComplement,
  generateScoreString,
  getTiebreakComplement,
};

export default scoreGovernor;
