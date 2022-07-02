import { tallyParticipantResults } from '../../getters/roundRobinTally/roundRobinTally';
import { analyzeMatchUp } from '../../getters/analyzeMatchUp';
import { matchUpIsComplete } from './matchUpIsComplete';

const queryGovernor = {
  tallyParticipantResults,
  matchUpIsComplete,
  analyzeMatchUp,
};

export default queryGovernor;
