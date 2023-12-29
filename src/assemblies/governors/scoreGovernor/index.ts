import { generateTieMatchUpScore } from '../../generators/tieMatchUpScore/generateTieMatchUpScore';
import { generateScoreString } from '../../generators/matchUps/generateScoreString';
import { tidyScore } from '../../../analyze/scoreParser/scoreParser';
import { reverseScore } from '../../generators/score/reverseScore';

import { isValidMatchUpFormat } from '../../../validators/isValidMatchUpFormat';
import { validateTieFormat } from '../../../validators/validateTieFormat';
import { validateScore } from '../../../validators/validateScore';

import { checkScoreHasValue } from '../../../query/matchUp/checkScoreHasValue';
import { analyzeSet } from '../../../query/matchUp/analyzeSet';

import { updateTieMatchUpScore } from '../../../mutate/matchUps/score/tieMatchUpScore';

import {
  checkSetIsComplete,
  keyValueScore,
} from '../../../mutate/score/keyValueScore';
import {
  getSetComplement,
  getTiebreakComplement,
} from '../../../query/matchUp/getComplement';

// history
import { calculateHistoryScore } from '../../../mutate/matchUps/score/history/calculateHistoryScore';
import { setServingSide } from '../../../mutate/matchUps/score/history/setServingSide';
import { clearHistory } from '../../../mutate/matchUps/score/history/clearHistory';
import { addPoint } from '../../../mutate/matchUps/score/history/addPoint';
import { addGame } from '../../../mutate/matchUps/score/history/addGame';
import { addShot } from '../../../mutate/matchUps/score/history/addShot';
import { addSet } from '../../../mutate/matchUps/score/history/addSet';
import { redo } from '../../../mutate/matchUps/score/history/redo';
import { undo } from '../../../mutate/matchUps/score/history/undo';
import { umo } from '../../../mutate/matchUps/score/history/umo';

// renamed
import { stringify } from '../../generators/matchUpFormatCode/stringify';
import { parse } from '../../generators/matchUpFormatCode/parse';

export const scoreGovernor = {
  analyzeSet,
  checkScoreHasValue,
  checkSetIsComplete,
  generateScoreString,
  generateTieMatchUpScore,
  getSetComplement,
  getTiebreakComplement,
  isValidMatchUpFormat,
  keyValueScore,
  parseMatchUpFormat: parse,
  reverseScore,
  stringifyMatchUpFormat: stringify,
  tidyScore,
  updateTieMatchUpScore,
  validateScore,
  validateTieFormat,

  calculateHistoryScore,
  setServingSide,
  clearHistory,
  addPoint,
  addGame,
  addShot,
  addSet,
  redo,
  undo,
  umo,
};

export default scoreGovernor;
