import { matchUpFormatCode } from 'tods-matchup-format-code';

import {
  DEFAULTED,
  RETIRED,
  WALKOVER,
} from '../../../../constants/matchUpStatusConstants';
import { FORMAT_STANDARD } from '../../../../fixtures/scoring/matchUpFormats/formatConstants';

export function countSets({
  score,
  tallyPolicy,
  matchUpStatus,
  matchUpFormat = FORMAT_STANDARD,
  winningSide: matchUpWinningSide,
}) {
  const setsTally = [0, 0];
  const { sets } = score || {};
  const matchUpWinnerIndex = matchUpWinningSide - 1;
  const parsedMatchUpFormat = matchUpFormatCode.parse(matchUpFormat);
  const setsToWin = getSetsToWin(parsedMatchUpFormat?.bestOf || 3);

  if (
    (matchUpStatus === DEFAULTED && tallyPolicy?.setsCreditForDefaults) ||
    (matchUpStatus === WALKOVER && tallyPolicy?.setsCreditForWalkovers)
  ) {
    // in the case of WALKOVER or DEFAULT, matchUp winner gets full sets to win value
    setsTally[matchUpWinnerIndex] = setsToWin;
  } else {
    if (sets) {
      sets.forEach((set) => {
        const { winningSide: setWinningSide } = set;
        if (setWinningSide) setsTally[setWinningSide - 1] += 1;
      });
    }
  }
  if (matchUpStatus === RETIRED) {
    // if the loser has setsToWin then last set was incomplete and needs to be subtracted from loser
    if (+setsTally[1 - matchUpWinnerIndex] === setsToWin)
      setsTally[1 - matchUpWinnerIndex] -= 1;
    setsTally[matchUpWinnerIndex] = setsToWin;
  }
  return setsTally;
}

export function countGames({
  score,
  tallyPolicy,
  matchUpStatus,
  matchUpFormat = FORMAT_STANDARD,
  winningSide: matchUpWinningSide,
}) {
  const { sets } = score || {};
  const matchUpWinnerIndex = matchUpWinningSide - 1;
  const parsedMatchUpFormat = matchUpFormatCode.parse(matchUpFormat);
  let side1Score = 0,
    side2Score = 0;
  const setsToWin = getSetsToWin(parsedMatchUpFormat?.bestOf || 3);
  const gamesForSet = parsedMatchUpFormat?.setFormat?.setTo || 6;
  const tiebreakAt = parsedMatchUpFormat?.setFormat?.tiebreakAt || 6;
  if (!sets) return [side1Score, side2Score];

  const minimumGameWins = setsToWin * gamesForSet;
  const gamesTally = [[], []];
  if (
    (matchUpStatus === DEFAULTED && tallyPolicy?.gamesCreditForDefaults) ||
    (matchUpStatus === WALKOVER && tallyPolicy?.gamesCreditForWalkovers)
  ) {
    gamesTally[matchUpWinnerIndex].push(minimumGameWins);
  } else {
    if (sets) {
      sets.forEach((set) => {
        ({ side1Score, side2Score } = set);
        gamesTally[0].push(parseInt(side1Score || 0));
        gamesTally[1].push(parseInt(side2Score || 0));
      });
    }
  }
  if (matchUpStatus === RETIRED) {
    const setsTally = countSets({
      sets,
      winningSide: matchUpWinningSide,
      matchUpStatus,
      matchUpFormat,
    });
    const totalSets = setsTally.reduce((a, b) => a + b, 0);
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
    // if the total # of sets is less than gamesTally[x].length award gamesForSet to winner
    if (totalSets > gamesTally[matchUpWinnerIndex].length) {
      gamesTally[matchUpWinnerIndex].push(gamesForSet);
    }
  }
  const result = [
    gamesTally[0].reduce((a, b) => a + b, 0),
    gamesTally[1].reduce((a, b) => a + b, 0),
  ];
  if (
    [RETIRED, WALKOVER, DEFAULTED].includes(matchUpStatus) &&
    result[matchUpWinnerIndex] < minimumGameWins
  )
    result[matchUpWinnerIndex] = minimumGameWins;
  return result;

  function getComplement(value) {
    if (!parsedMatchUpFormat || value === '') return;
    if (+value === tiebreakAt - 1 || +value === tiebreakAt)
      return parseInt(tiebreakAt || 0) + 1;
    if (+value < tiebreakAt) return gamesForSet;
    return tiebreakAt;
  }
}

export function countPoints({ score }) {
  const pointsTally = [0, 0];
  score?.sets?.forEach((set) => {
    if (set.side1TiebreakScore)
      pointsTally[0] += parseInt(set.side1TiebreakScore);
    if (set.side2TiebreakScore)
      pointsTally[1] += parseInt(set.side2TiebreakScore);
  });
  return pointsTally;
}
function getSetsToWin(bestOfGames) {
  return (bestOfGames && Math.ceil(bestOfGames / 2)) || 1;
}
