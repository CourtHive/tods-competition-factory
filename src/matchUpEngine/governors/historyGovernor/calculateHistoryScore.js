import { isValid } from '../matchUpFormatGovernor/isValid';
import { parse } from '../matchUpFormatGovernor/parse';
import { getHistory } from './getHistory';

import { SUCCESS } from '../../../constants/resultConstants';
import {
  INVALID_MATCHUP_FORMAT,
  INVALID_VALUES,
  MISSING_MATCHUP_FORMAT,
} from '../../../constants/errorConditionConstants';
import { generateScoreString } from '../../generators/generateScoreString';

export function calculateHistoryScore({ matchUp }) {
  const result = getHistory({ matchUp });
  if (result.error) return result;

  const history = result.history;
  if (!Array.isArray(history))
    return { error: INVALID_VALUES, info: 'history is not an array' };

  if (!matchUp.matchUpFormat) return { error: MISSING_MATCHUP_FORMAT };
  if (!isValid(matchUp.matchUpFormat)) return { error: INVALID_MATCHUP_FORMAT };

  const parsedFormat = parse(matchUp.matchUpFormat);
  const { bestOf, finalSetFormat, setFormat } = parsedFormat;

  const newSet = () => {
    return {
      winningSide: undefined,
      side1TiebreakScore: 0,
      side2TiebreakScore: 0,
      side1PointScore: '',
      side2PointScore: '',
      side1Score: 0,
      side2Score: 0,
      games: [],
    };
  };

  const newGame = () => {
    return {
      winningSide: undefined,
      points: [],
    };
  };

  const newPoint = () => {
    return {
      winningSide: undefined,
      side1Score: '',
      side2Score: '',
    };
  };

  const isValidSide = (value) => [1, 2].includes(value);

  let servingSide;
  const score = { sets: [] };
  let point = newPoint();
  let game = newGame();
  let set = newSet();
  let isFinalSet;

  for (const item of history) {
    isFinalSet = score.sets.length + 1 === bestOf;
    const format = isFinalSet && finalSetFormat ? finalSetFormat : setFormat;
    const { tiebreakAt, setTo, NoAD } = format;

    const isTiebreak =
      set.side1Score === tiebreakAt && set.side1Score === set.side2Score;
    const isTiebreakSet = !!format.tiebreakSet;

    const completeSet = (winningSide) => {
      set.winningSide = winningSide;
      score.sets.push(set);
      set = newSet();
      servingSide = 3 - servingSide;
    };

    if (isValidSide(item.srv)) servingSide = item.srv;
    if (['p', 's', 'g'].includes(item.u)) {
      // unknown outcome
    }
    if (isValidSide(item.p)) {
      const winningSide = item.p;
      point.winningSide = winningSide;
      point = newPoint();

      if (isTiebreak) true;
      if (isTiebreakSet) true;
      // check if game/match/set is complete
    }
    if (isValidSide(item.g)) {
      const winningSide = item.g;
      game.winningSide = winningSide;
      const winningScoreSide = `side${winningSide}Score`;
      const losingScoreSide = `side${3 - winningSide}Score`;
      set.side1TiebreakScore = 0;
      set.side2TiebreakScore = 0;
      set.side1PointScore = '';
      set.side2PointScore = '';
      set[winningScoreSide] += 1;
      set.games.push(game);
      game = newGame();
      servingSide = 3 - servingSide;

      const setIsComplete =
        set[winningScoreSide] === setTo &&
        set[winningScoreSide] - set[losingScoreSide] >= (NoAD ? 1 : 2);
      if (setIsComplete) completeSet(winningSide);
      if (isFinalSet) break;
    }
    if (isValidSide(item.s)) {
      const winningSide = item.s;
      completeSet(winningSide);
      // check if match is complete
    }
  }

  const scoreString = generateScoreString(score);
  console.log(scoreString);

  return { ...SUCCESS, servingSide, score };
}
