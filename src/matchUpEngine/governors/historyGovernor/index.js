import { calculateHistoryScore } from './calculateHistoryScore';
import { setServingSide } from './setServingSide';
import { clearHistory } from './clearHistory';
import { addPoint } from './addPoint';
import { addGame } from './addGame';
import { addShot } from './addShot';
import { addSet } from './addSet';
import { umo } from './umo';

export const historyGovernor = {
  calculateHistoryScore,
  setServingSide,
  clearHistory,
  addPoint,
  addGame,
  addShot,
  addSet,
  umo,
};

export default historyGovernor;
