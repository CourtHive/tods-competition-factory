import { calculateHistoryScore } from './calculateHistoryScore';
import { addPoint } from './addPoint';
import { addGame } from './addGame';
import { addSet } from './addSet';
import { umo } from './umo';

export const historyGovernor = {
  calculateHistoryScore,
  addPoint,
  addGame,
  addSet,
  umo,
};

export default historyGovernor;
