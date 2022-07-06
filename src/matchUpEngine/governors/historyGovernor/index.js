import { calculateHistoryScore } from './calculateHistoryScore';
import { clearHistory } from './clearHistory';
import { addPoint } from './addPoint';
import { addGame } from './addGame';
import { addSet } from './addSet';
import { umo } from './umo';

export const historyGovernor = {
  calculateHistoryScore,
  clearHistory,
  addPoint,
  addGame,
  addSet,
  umo,
};

export default historyGovernor;
