import { tallyParticipantResults } from './roundRobinTally/roundRobinTally';
import { getSetComplement, getTiebreakComplement } from './getComplement';
import { validateTieFormat } from '../matchUpGovernor/tieFormatUtilities';
import { keyValueScore, checkSetIsComplete } from './keyValueScore';
import { generateScoreString } from './generateScoreString';
import { analyzeMatchUp } from './analyzeMatchUp';
import { analyzeSet } from './analyzeSet';

export const scoreGovernor = {
  tallyParticipantResults,
  getTiebreakComplement,
  generateScoreString,
  checkSetIsComplete,
  validateTieFormat,
  getSetComplement,
  analyzeMatchUp,
  keyValueScore,
  analyzeSet,
};

export default scoreGovernor;
