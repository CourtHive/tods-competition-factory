import { analyzeSet } from './analyzeSet';
import { analyzeMatchUp } from './analyzeMatchUp';
import { tallyBracket } from './roundRobinTally';
import { generateScoreString } from './generateScoreString';
import { getSetComplement, getTiebreakComplement } from './getComplement';

const scoreGovernor = {
  analyzeSet,
  tallyBracket,
  analyzeMatchUp,
  getSetComplement,
  generateScoreString,
  getTiebreakComplement,
};

export default scoreGovernor;
