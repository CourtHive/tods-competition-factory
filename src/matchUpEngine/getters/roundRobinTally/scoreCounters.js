import { parse } from '../../governors/matchUpFormatGovernor/parse';

import { FORMAT_STANDARD } from '../../../fixtures/scoring/matchUpFormats';
import {
  DEFAULTED,
  RETIRED,
  WALKOVER,
} from '../../../constants/matchUpStatusConstants';

export function countSets({
  winningSide: matchUpWinningSide,
  matchUpFormat = FORMAT_STANDARD,
  matchUpStatus,
  tallyPolicy,
  score,
}) {
  const setsTally = [0, 0];
  const { sets } = score || {};
  const matchUpWinnerIndex = matchUpWinningSide - 1;
  const parsedMatchUpFormat = parse(matchUpFormat);
  const setsToWin = getSetsToWin(parsedMatchUpFormat?.bestOf || 1);

  if (
    (matchUpStatus === DEFAULTED && tallyPolicy?.setsCreditForDefaults) ||
    (matchUpStatus === WALKOVER && tallyPolicy?.setsCreditForWalkovers)
  ) {
    // in the case of WALKOVER or DEFAULT, matchUp winner gets full sets to win value
    setsTally[matchUpWinnerIndex] = setsToWin;
  } else {
    for (const set of sets || []) {
      const { winningSide: setWinningSide } = set;
      if (setWinningSide) setsTally[setWinningSide - 1] += 1;
    }
  }
  if (matchUpStatus === RETIRED) {
    // if the loser has setsToWin then last set was incomplete and needs to be subtracted from loser
    if (+setsTally[1 - matchUpWinnerIndex] === setsToWin)
      setsTally[1 - matchUpWinnerIndex] -= 1;
    if (tallyPolicy?.setsCreditForRetirements)
      setsTally[matchUpWinnerIndex] = setsToWin;
  }
  return setsTally;
}

export function countGames({
  winningSide: matchUpWinningSide,
  matchUpFormat = FORMAT_STANDARD,
  matchUpStatus,
  tallyPolicy,
  score,
}) {
  // IMPORTANT: recognize finalSetFormat
  const { sets } = score || {};
  if (!sets) return [0, 0];

  const matchUpWinnerIndex = matchUpWinningSide - 1;
  const parsedMatchUpFormat = parse(matchUpFormat);
  const bestOf = parsedMatchUpFormat?.bestOf || 1;
  const setsToWin = getSetsToWin(bestOf);
  const tiebreakAt = parsedMatchUpFormat?.setFormat?.tiebreakAt || 0;

  const gamesTally = [[], []];
  if (
    (matchUpStatus === DEFAULTED && tallyPolicy?.gamesCreditForDefaults) ||
    (matchUpStatus === WALKOVER && tallyPolicy?.gamesCreditForWalkovers)
  ) {
    const gamesForSet = parsedMatchUpFormat?.setFormat?.setTo || 0;
    const minimumGameWins = setsToWin * gamesForSet;
    gamesTally[matchUpWinnerIndex].push(minimumGameWins);
  } else {
    sets.forEach((set, i) => {
      const setNumber = set.setNumber || i + 1;
      const whichFormat =
        setNumber > setsToWin && parsedMatchUpFormat?.finalSetFormat
          ? 'finalSetFormat'
          : 'setFormat';
      const based = parsedMatchUpFormat?.[whichFormat]?.based;
      if (isGamesBased(based)) {
        const { side1Score, side2Score } = set;
        gamesTally[0].push(parseInt(side1Score || 0));
        gamesTally[1].push(parseInt(side2Score || 0));
      }
    });
  }
  if (matchUpStatus === RETIRED) {
    // setFormat must consider whether retirment occurred in a finalSet which has a different format
    const whichFormat =
      sets.length > setsToWin && parsedMatchUpFormat?.finalSetFormat
        ? 'finalSetFormat'
        : 'setFormat';
    const format = parsedMatchUpFormat?.[whichFormat];
    if (isGamesBased(format.based)) {
      const gamesForSet = format?.setTo || 0;

      const getComplement = (value) => {
        if (!parsedMatchUpFormat || value === '') return;
        if (+value === tiebreakAt - 1 || +value === tiebreakAt)
          return parseInt(tiebreakAt || 0) + 1;
        if (+value < tiebreakAt) return gamesForSet;
        return tiebreakAt;
      };

      const setsTally = countSets({
        winningSide: matchUpWinningSide,
        matchUpStatus,
        matchUpFormat,
        sets,
      });
      const loserLeadSet = gamesTally
        .map((g) => g[matchUpWinnerIndex] <= g[1 - matchUpWinnerIndex])
        .reduce((a, b) => a + b, 0);
      // if sets where loser lead > awarded sets, adjust last game to winner
      if (loserLeadSet > setsTally[1 - matchUpWinnerIndex]) {
        const talliedGames = gamesTally[matchUpWinnerIndex].length;
        const complement = getComplement(
          gamesTally[1 - matchUpWinnerIndex][talliedGames - 1]
        );
        if (complement)
          gamesTally[matchUpWinnerIndex][talliedGames - 1] = complement;
      }
      // if the gamesTally[x].length is less than the number of sets to win award gamesForSet to winner
      // gamesTally[x].length is an array of games won for each set, so length is number of sets
      if (
        setsToWin > gamesTally[matchUpWinnerIndex].length &&
        tallyPolicy?.gamesCreditForRetirements
      ) {
        gamesTally[matchUpWinnerIndex].push(gamesForSet);
      }
    }
  }

  return [
    gamesTally[0].reduce((a, b) => a + b, 0),
    gamesTally[1].reduce((a, b) => a + b, 0),
  ];
}

export function countPoints({ matchUpFormat, score }) {
  const parsedMatchUpFormat = parse(matchUpFormat);
  const bestOf = parsedMatchUpFormat?.bestOf || 1;
  const setsToWin = getSetsToWin(bestOf);
  const pointsTally = [0, 0];

  score?.sets?.forEach((set, i) => {
    const setNumber = set.setNumber || i + 1;
    const whichFormat =
      setNumber > setsToWin && parsedMatchUpFormat?.finalSetFormat
        ? 'finalSetFormat'
        : 'setFormat';
    const based = parsedMatchUpFormat?.[whichFormat]?.based;
    if (isPointsBased(based)) {
      const { side1Score, side2Score } = set;
      if (side1Score) pointsTally[0] += parseInt(side1Score || 0);
      if (side2Score) pointsTally[1] += parseInt(side2Score || 0);
    } else {
      if (set.side1TiebreakScore)
        pointsTally[0] += parseInt(set.side1TiebreakScore || 0);
      if (set.side2TiebreakScore)
        pointsTally[1] += parseInt(set.side2TiebreakScore || 0);
    }
  });
  return pointsTally;
}

function getSetsToWin(bestOfGames) {
  return (bestOfGames && Math.ceil(bestOfGames / 2)) || 1;
}

function isPointsBased(based) {
  return based === 'P';
}

function isGamesBased(based) {
  return !isPointsBased(based);
}
