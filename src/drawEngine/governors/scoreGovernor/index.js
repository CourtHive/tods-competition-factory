import { analyzeSet } from './analyzeSet';
import { analyzeMatchUp } from './analyzeMatchUp';
import { tallyParticipantResults } from './roundRobinTally/roundRobinTally';
import {
  keyValueScore,
  keyValueConstants,
  checkSetIsComplete,
} from './keyValueScore';
import { generateScoreString } from './generateScoreString';
import { getSetComplement, getTiebreakComplement } from './getComplement';

export const scoreGovernor = {
  analyzeSet,
  keyValueScore,
  analyzeMatchUp,
  getSetComplement,
  keyValueConstants,
  checkSetIsComplete,
  generateScoreString,
  getTiebreakComplement,
  tallyParticipantResults,
};

export default scoreGovernor;
