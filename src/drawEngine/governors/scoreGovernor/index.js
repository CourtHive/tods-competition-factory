import { analyzeSet } from './analyzeSet';
import { analyzeMatchUp } from './analyzeMatchUp';
import { tallyBracket } from './roundRobinTally';
import {
  keyValueScore,
  getWinningSide,
  getLeadingSide,
  checkSetIsComplete,
} from './keyValueScore';
import { generateScoreString } from './generateScoreString';
import { getSetComplement, getTiebreakComplement } from './getComplement';

export const scoreGovernor = {
  analyzeSet,
  tallyBracket,
  keyValueScore,
  getWinningSide,
  getLeadingSide,
  analyzeMatchUp,
  getSetComplement,
  checkSetIsComplete,
  generateScoreString,
  getTiebreakComplement,
};

export default scoreGovernor;
