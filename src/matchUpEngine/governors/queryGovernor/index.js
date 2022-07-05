import { tallyParticipantResults } from '../../getters/roundRobinTally/roundRobinTally';
import { analyzeMatchUp } from '../../getters/analyzeMatchUp';
import { matchUpIsComplete } from './matchUpIsComplete';
import { scoreHasValue } from './scoreHasValue';

const queryGovernor = {
  tallyParticipantResults,
  matchUpIsComplete,
  analyzeMatchUp,
  scoreHasValue,
};

export default queryGovernor;
