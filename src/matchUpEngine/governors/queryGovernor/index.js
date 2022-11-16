import { tallyParticipantResults } from '../../getters/roundRobinTally/roundRobinTally';
import { getMatchUpType } from '../../../drawEngine/accessors/matchUpAccessor';
import { analyzeMatchUp } from '../../getters/analyzeMatchUp';
import { matchUpIsComplete } from './matchUpIsComplete';
import { scoreHasValue } from './scoreHasValue';

const queryGovernor = {
  tallyParticipantResults,
  matchUpIsComplete,
  analyzeMatchUp,
  getMatchUpType,
  scoreHasValue,
};

export default queryGovernor;
