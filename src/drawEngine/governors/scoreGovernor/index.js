import { tallyParticipantResults } from './roundRobinTally/roundRobinTally';
import { generateTieMatchUpScore } from '../../accessors/matchUpAccessor';
import { getSetComplement, getTiebreakComplement } from './getComplement';
import { validateTieFormat } from '../matchUpGovernor/tieFormatUtilities';
import { checkSetIsComplete, keyValueScore } from './keyValueScore';
import { generateScoreString } from './generateScoreString';
import { matchUpFormatCode } from './matchUpFormatCode';
import { analyzeMatchUp } from './analyzeMatchUp';
import { analyzeSet } from './analyzeSet';

export const scoreGovernor = {
  stringifyMatchUpFormat: matchUpFormatCode.stringify,
  isValidMatchUpFormat: matchUpFormatCode.isValid,
  parseMatchUpFormat: matchUpFormatCode.parse,
  generateTieMatchUpScore,
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
