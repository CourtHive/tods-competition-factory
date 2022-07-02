import { tallyParticipantResults } from '../../getters/roundRobinTally/roundRobinTally';
import { analyzeMatchUp } from '../../getters/analyzeMatchUp';

const queryGovernor = {
  tallyParticipantResults,
  analyzeMatchUp,
};

export default queryGovernor;
