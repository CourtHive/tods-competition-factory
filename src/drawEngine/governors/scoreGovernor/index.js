import { tallyParticipantResults } from './roundRobinTally/roundRobinTally';
import { generateTieMatchUpScore } from '../../accessors/matchUpAccessor';
import { getSetComplement, getTiebreakComplement } from './getComplement';
import { validateTieFormat } from '../matchUpGovernor/tieFormatUtilities';
import { checkSetIsComplete, keyValueScore } from './keyValueScore';
import { matchUpFormatCode } from 'tods-matchup-format-code';
import { generateScoreString } from './generateScoreString';
import { analyzeMatchUp } from './analyzeMatchUp';
import { analyzeSet } from './analyzeSet';

export const scoreGovernor = {
  isValidMatchUpFormat: matchUpFormatCode.isValidMatchUpFormat,
  stringifyMatchUpFormat: matchUpFormatCode.stringify,
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
