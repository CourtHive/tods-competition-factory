import { generateScoreString } from '../../generators/generateScoreString';
import { isValid } from '../matchUpFormatGovernor/isValid';
import { parse } from '../matchUpFormatGovernor/parse';
import { getHistory } from './getHistory';

import { SUCCESS } from '../../../constants/resultConstants';
import {
  INVALID_MATCHUP_FORMAT,
  INVALID_VALUES,
  MISSING_MATCHUP_FORMAT,
} from '../../../constants/errorConditionConstants';

export function calculateHistoryScore({ matchUp }) {
  const history = getHistory({ matchUp })?.history || [];

  if (!Array.isArray(history))
    return { error: INVALID_VALUES, info: 'history is not an array' };

  if (!matchUp.matchUpFormat) return { error: MISSING_MATCHUP_FORMAT };
  if (!isValid(matchUp.matchUpFormat)) return { error: INVALID_MATCHUP_FORMAT };

  const parsedFormat = parse(matchUp.matchUpFormat);
  const { bestOf, finalSetFormat, setFormat } = parsedFormat;

  const pointProgression = ['0', '15', '30', '40', 'A', 'G'];
  //  const statsCounters = { 1: {}, 2: {} };
  const score = { sets: [] };

  let tiebreakServingSide;
  let sidePoints = [0, 0];
  let servingSide = 1;
  let unknowns = [];
  let isFinalSet;
  let faults = 0;

  const isValidSide = (value) => [1, 2].includes(value);

  const newSet = () => {
    return {
      winningSide: undefined,
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
      shots: [],
    };
  };

  let point = newPoint();
  let game = newGame();
  let set = newSet();

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
      score.sets.push(set);
      point = newPoint();
      game = newGame();
      set = newSet();
      cleanup();
    };

    const completeGame = (winningSide) => {
      game.winningSide = winningSide;
      set.games.push(game);
      point = newPoint();
      game = newGame();
      cleanup();

      const winningScoreSide = `side${winningSide}Score`;
      set[winningScoreSide] += 1;
    };

    if (isValidSide(item.srv)) servingSide = item.srv;

    if (['p', 's', 'g', 'o'].includes(item.u)) {
      unknowns.push(item.u);
    }
    if (item.o) {
      point.shots.push(item.o);

      if (item.fault) faults += 1;

      if (faults === 2) {
        point.winningSide = 3 - servingSide;
      }
    }
    if (isValidSide(item.p)) {
      const winningSide = item.p;
      point.winningSide = winningSide;

      const winningIndex = winningSide - 1;

      game.points.push(point);
      point = newPoint();

      const getTiebreakServingSide = () => {
        const pointsCount = sidePoints.reduce((a, b) => a + b);
        const value = (pointsCount % 4) / 4;
        return value > 0.5 ? servingSide : 3 - servingSide;
      };

      if (isTiebreak || isTiebreakSet) {
        sidePoints[winningIndex] += 1;
        tiebreakServingSide = getTiebreakServingSide();
        set[`side${winningSide}TiebreakScore`] = sidePoints[winningIndex];

        const winBy = tiebreakNoAD ? 1 : 2;
        if (
          sidePoints[winningIndex] >= tiebreakTo &&
          sidePoints[winningIndex] >= sidePoints[1 - winningIndex] + winBy
        ) {
          completeGame(winningSide);
          continue;
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

        if (
          sidePoints[winningIndex] === 5 ||
          (sidePoints[winningIndex] === 4 &&
            sidePoints[1 - winningIndex] < 3) ||
          (NoAD && sidePoints[winningIndex] === 4)
        ) {
          completeGame(winningSide);
          continue;
        }
      }

      set.side1PointScore = pointProgression[sidePoints[0]];
      set.side2PointScore = pointProgression[sidePoints[1]];
    }

    if (isValidSide(item.g)) {
      const winningSide = item.g;
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
    if (isValidSide(item.s)) {
      const winningSide = item.s;
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

  if (set.side1Score || set.side2Score || set.games.length) {
    score.sets.push(set);
  }

  score.scoreStringSide1 = generateScoreString(score);
  score.scoreStringSide2 = generateScoreString({ ...score, reversed: true });

  servingSide = tiebreakServingSide || servingSide;

  return { ...SUCCESS, servingSide, score };
}
