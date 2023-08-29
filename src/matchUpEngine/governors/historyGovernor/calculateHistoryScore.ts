import { generateScoreString } from '../../generators/generateScoreString';
import { isConvertableInteger } from '../../../utilities/math';
import { isValid } from '../matchUpFormatGovernor/isValid';
import { parse } from '../matchUpFormatGovernor/parse';
import { getHistory } from './getHistory';

import { SUCCESS } from '../../../constants/resultConstants';
import {
  INVALID_MATCHUP_FORMAT,
  INVALID_VALUES,
  MISSING_MATCHUP_FORMAT,
} from '../../../constants/errorConditionConstants';

export function calculateHistoryScore({ matchUp, updateScore }) {
  const history = getHistory({ matchUp })?.history || [];

  if (!Array.isArray(history))
    return { error: INVALID_VALUES, info: 'history is not an array' };

  const { matchUpFormat } = matchUp;
  if (!matchUpFormat) return { error: MISSING_MATCHUP_FORMAT };
  if (!isValid(matchUpFormat)) return { error: INVALID_MATCHUP_FORMAT };

  const parsedFormat: any = parse(matchUpFormat);
  const { bestOf, finalSetFormat, setFormat } = parsedFormat;

  const pointProgression = ['0', '15', '30', '40', 'A', 'G'];
  //  const statsCounters = { 1: {}, 2: {} };
  const score: any = { sets: [] };

  let unknowns: any[] = [];
  let tiebreakServingSide;
  let sidePoints = [0, 0];
  let servingSide = 1;
  let setNumber = 0;
  let isFinalSet;
  let faults = 0;

  const isValidSide = (value) => [1, 2].includes(value);

  const newSet = () => {
    setNumber += 1;
    return {
      winningSide: undefined,
      side1Score: 0,
      side2Score: 0,
      setNumber,
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
      shots: [],
    };
  };

  let point: any = newPoint();
  let game: any = newGame();
  let set: any = newSet();

  let processedCount = 0;
  for (const item of history) {
    processedCount += 1;

    isFinalSet = score.sets.length + 1 === bestOf;
    const format = isFinalSet && finalSetFormat ? finalSetFormat : setFormat;
    const { tiebreakAt, setTo, NoAD, tiebbreakFormat } = format;

    const isTiebreak =
      set.side1Score === tiebreakAt && set.side1Score === set.side2Score;
    const isTiebreakSet = !!format.tiebreakSet;
    const tiebreakDetails = isTiebreakSet
      ? format.tiebreakSet
      : tiebbreakFormat;
    const { tiebreakTo, NoAD: tiebreakNoAD } = tiebreakDetails || {};

    const cleanup = () => {
      tiebreakServingSide = undefined;
      sidePoints = [0, 0];
      servingSide = 3 - servingSide;
      set.side1TiebreakScore = 0;
      set.side2TiebreakScore = 0;
      set.side1PointScore = '';
      set.side2PointScore = '';
      faults = 0;
    };
    const completeSet = (winningSide) => {
      set.winningSide = winningSide;

      const { s, ...rest } = set;
      if (s) {
        // strip out shorthand
      }

      score.sets.push(rest);
      point = newPoint();
      game = newGame();
      set = newSet();
      cleanup();
    };

    const completeGame = (winningSide) => {
      game.winningSide = winningSide;

      const { g, ...rest } = game;
      if (g) {
        // strip out shorthand
      }

      set.games.push(rest);
      point = newPoint();
      game = newGame();
      cleanup();

      const winningScoreSide = `side${winningSide}Score`;
      set[winningScoreSide] += 1;
    };

    const completePoint = (winningSide) => {
      point.winningSide = winningSide;

      const { p, ...rest } = point;
      if (p) {
        // strip out shorthand
      }

      game.points.push(rest);
      point = newPoint();
      faults = 0;

      const getTiebreakServingSide = () => {
        const pointsCount = sidePoints.reduce((a, b) => a + b);
        const value = (pointsCount % 4) / 4;
        return value > 0.5 ? servingSide : 3 - servingSide;
      };

      const winningIndex = winningSide - 1;
      if (isTiebreak || isTiebreakSet) {
        sidePoints[winningIndex] += 1;
        tiebreakServingSide = getTiebreakServingSide();
        set[`side${winningSide}TiebreakScore`] = sidePoints[winningIndex];
        set[`side${3 - winningSide}TiebreakScore`] =
          sidePoints[1 - winningIndex];

        const winBy = tiebreakNoAD ? 1 : 2;
        if (
          sidePoints[winningIndex] >= tiebreakTo &&
          sidePoints[winningIndex] >= sidePoints[1 - winningIndex] + winBy
        ) {
          completeGame(winningSide);
          return { gameCompleted: true };
        }
      } else {
        if (
          sidePoints[1 - winningIndex] === 4 &&
          sidePoints[winningIndex] === 3
        ) {
          // return to deuce
          sidePoints[1 - winningIndex] -= 1;
        } else {
          sidePoints[winningIndex] += 1;
        }

        set.side1PointScore = pointProgression[sidePoints[0]];
        set.side2PointScore = pointProgression[sidePoints[1]];

        if (
          sidePoints[winningIndex] === 5 ||
          (sidePoints[winningIndex] === 4 &&
            sidePoints[1 - winningIndex] < 3) ||
          (NoAD && sidePoints[winningIndex] === 4)
        ) {
          completeGame(winningSide);
          return { gameCompleted: true };
        }
      }
      return undefined;
    };

    if (isValidSide(item.srv)) {
      servingSide = item.srv;
    }

    if (['p', 's', 'g', 'o'].includes(item.u)) {
      unknowns.push(item.u);
    }

    if (item.shotOutcome) {
      point.shots.push(item);

      const isServe = item.shotType === 'SERVE';

      if (isServe && ['OUT', 'NET'].includes(item.shotOutcome)) faults += 1;

      if (faults === 2) {
        const winningSide = 3 - servingSide;
        completePoint(winningSide);
      }
    }
    if (isValidSide(item.p) || isConvertableInteger(item.pointNumber)) {
      const winningSide = item.winningSide || item.p;
      const result = completePoint(winningSide);
      if (result?.gameCompleted) continue;
    }

    if (isValidSide(item.g) || isConvertableInteger(item.gameNumber)) {
      const winningSide = item.winningSide || item.g;
      game.winningSide = winningSide;
      const winningScoreSide = `side${winningSide}Score`;
      const losingScoreSide = `side${3 - winningSide}Score`;

      if (unknowns.length) {
        if (unknowns.includes('p')) {
          // resolve any unknown points where possible
        }
        unknowns = [];
      }

      completeGame(winningSide);

      const setIsComplete =
        set[winningScoreSide] === setTo &&
        set[winningScoreSide] - set[losingScoreSide] >= (NoAD ? 1 : 2);

      if (setIsComplete) {
        completeSet(winningSide);
        if (isFinalSet) break;
      }
    }
    if (isValidSide(item.s) || isConvertableInteger(item.setNumber)) {
      const winningSide = item.winningSide || item.s;
      completeSet(winningSide);

      if (unknowns.length) {
        if (unknowns.includes('p')) {
          // resolve any unknown points where possible
          // only possible to resolve unknown points if the winner of the game in which the points occur would win the set by winning the game
        }
        if (unknowns.includes('g')) {
          // resolve any unknown games where possible
        }
        unknowns = [];
      }

      // check if match is complete
      if (isFinalSet) break;
    }
  }

  if (processedCount !== history.length) {
    console.log({ error: 'Match completed with excess history' });
  }

  if (
    set.side1Score ||
    set.side2Score ||
    set.games.length ||
    set.side1TiebreakScore ||
    set.side2TiebreakScore
  ) {
    score.sets.push(set);
  }

  score.scoreStringSide1 = generateScoreString({ ...score, matchUpFormat });
  score.scoreStringSide2 = generateScoreString({
    ...score,
    matchUpFormat,
    reversed: true,
  });

  servingSide = tiebreakServingSide || servingSide;

  if (updateScore) matchUp.score = score;

  return { ...SUCCESS, servingSide, score };
}
