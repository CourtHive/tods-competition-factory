import { matchUpStatusConstants } from '../../../constants/matchUpActionConstants';
import { tallyParticipantResults } from './roundRobinTally/roundRobinTally';
import { generateTieMatchUpScore } from '../../accessors/matchUpAccessor';
import { getSetComplement, getTiebreakComplement } from './getComplement';
import { validateTieFormat } from '../matchUpGovernor/tieFormatUtilities';
import { checkSetIsComplete, keyValueScore } from './keyValueScore';
import { matchUpTypes } from '../../../constants/matchUpTypes';
import { generateScoreString } from './generateScoreString';
import { stringify } from './matchUpFormatCode/stringify';
import { isValid } from './matchUpFormatCode/isValid';
import { analyzeMatchUp } from './analyzeMatchUp';
import { parse } from './matchUpFormatCode/parse';
import { analyzeSet } from './analyzeSet';

export const scoreGovernor = {
  stringifyMatchUpFormat: stringify,
  isValidMatchUpFormat: isValid,
  parseMatchUpFormat: parse,
  generateTieMatchUpScore,
  tallyParticipantResults,
  matchUpStatusConstants,
  getTiebreakComplement,
  generateScoreString,
  checkSetIsComplete,
  validateTieFormat,
  getSetComplement,
  analyzeMatchUp,
  keyValueScore,
  matchUpTypes,
  analyzeSet,
};

export default scoreGovernor;
