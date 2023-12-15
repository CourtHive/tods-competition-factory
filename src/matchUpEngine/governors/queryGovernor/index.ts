import { tallyParticipantResults } from '../../getters/roundRobinTally/roundRobinTally';
import { getMatchUpType } from '../../../drawEngine/accessors/matchUpAccessor';
import { analyzeMatchUp } from '../../getters/analyzeMatchUp';
import { validMatchUp, validMatchUps } from '../../../validators/validMatchUp';
import { matchUpIsComplete } from '../../../query/matchUp/matchUpIsComplete';
import { scoreHasValue } from '../../../query/matchUp/scoreHasValue';

const queryGovernor = {
  tallyParticipantResults,
  matchUpIsComplete,
  analyzeMatchUp,
  getMatchUpType,
  scoreHasValue,

  validMatchUps,
  validMatchUp,
};

export default queryGovernor;
