import { analyzeSet } from './analyzeSet';
import { analyzeMatchUp } from './analyzeMatchUp';
import { getSetComplement, getTiebreakComplement } from './getComplement';

const scoreGovernor = {
  analyzeSet,
  analyzeMatchUp,
  getSetComplement,
  getTiebreakComplement
};

export default scoreGovernor;
