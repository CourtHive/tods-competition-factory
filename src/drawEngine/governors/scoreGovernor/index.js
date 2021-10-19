import { tallyParticipantResults } from './roundRobinTally/roundRobinTally';
import { generateTieMatchUpScore } from '../../accessors/matchUpAccessor';
import { getSetComplement, getTiebreakComplement } from './getComplement';
import { validateTieFormat } from '../matchUpGovernor/tieFormatUtilities';
import { matchUpFormatCode } from 'tods-matchup-format-code';
import { generateScoreString } from './generateScoreString';
import { analyzeMatchUp } from './analyzeMatchUp';
import { keyValueScore } from './keyValueScore';
import { analyzeSet } from './analyzeSet';

export const scoreGovernor = {
  isValidMatchUpFormat: matchUpFormatCode.isValidMatchUpFormat,
  stringifyMatchUpFormat: matchUpFormatCode.stringify,
  parseMatchUpFormat: matchUpFormatCode.parse,
  generateTieMatchUpScore,
  tallyParticipantResults,
  getTiebreakComplement,
  generateScoreString,
  validateTieFormat,
  getSetComplement,
  analyzeMatchUp,
  keyValueScore,
  analyzeSet,
};

export default scoreGovernor;
