import { calculateHistoryScore } from './calculateHistoryScore';
import { addPoint } from './addPoint';
import { addGame } from './addGame';
import { addSet } from './addSet';

export const historyGovernor = {
  calculateHistoryScore,
  addPoint,
  addGame,
  addSet,
};

export default historyGovernor;
