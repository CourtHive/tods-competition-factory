import { tallyParticipantResults } from '../../../query/matchUps/roundRobinTally/roundRobinTally';
import { checkMatchUpIsComplete } from '../../../query/matchUp/checkMatchUpIsComplete';
import { validMatchUp, validMatchUps } from '../../../validators/validMatchUp';
import { checkScoreHasValue } from '../../../query/matchUp/checkScoreHasValue';
import { getMatchUpType } from '../../../query/matchUp/getMatchUpType';
import { analyzeMatchUp } from '../../../query/matchUp/analyzeMatchUp';

const queryGovernor = {
  tallyParticipantResults,
  checkMatchUpIsComplete,
  analyzeMatchUp,
  getMatchUpType,
  checkScoreHasValue,

  validMatchUps,
  validMatchUp,
};

export default queryGovernor;
