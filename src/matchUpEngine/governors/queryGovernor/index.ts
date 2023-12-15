import { tallyParticipantResults } from '../../getters/roundRobinTally/roundRobinTally';
import { getMatchUpType } from '../../../drawEngine/accessors/matchUpAccessor';
import { analyzeMatchUp } from '../../getters/analyzeMatchUp';
import { validMatchUp, validMatchUps } from '../../../validators/validMatchUp';
import { checkMatchUpIsComplete } from '../../../query/matchUp/checkMatchUpIsComplete';
import { checkScoreHasValue } from '../../../query/matchUp/checkScoreHasValue';

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
