import { parse } from '@Helpers/matchUpFormatCode/parse';

export function calculatePercentages({ participantResults, matchUpFormat, tallyPolicy, perPlayer, totalSets }) {
  const parsedGroupMatchUpFormat = (matchUpFormat && parse(matchUpFormat)) || {};
  const bestOfGames = parsedGroupMatchUpFormat.bestOf;
  const bracketSetsToWin = (bestOfGames && Math.ceil(bestOfGames / 2)) || 1;
  const bracketGamesForSet = parsedGroupMatchUpFormat.setFormat?.setTo;

  Object.keys(participantResults).forEach((participantId) => {
    const setsWon = participantResults[participantId].setsWon;
    const setsLost = participantResults[participantId].setsLost;
    const setsTotal = tallyPolicy?.groupTotalSetsPlayed
      ? totalSets
      : perPlayer * (bracketSetsToWin || 0) || setsWon + setsLost;
    let setsPct = Math.round((setsWon / setsTotal) * 1000) / 1000;
    if (setsPct === Infinity || isNaN(setsPct)) setsPct = setsTotal;

    const tieMatchUpsWon = participantResults[participantId].tieMatchUpsWon;
    const tieMatchUpsLost = participantResults[participantId].tieMatchUpsLost;
    const tieMatchUpsTotal = tieMatchUpsWon + tieMatchUpsLost;
    let tieMatchUpsPct = Math.round((tieMatchUpsWon / tieMatchUpsTotal) * 1000) / 1000;
    if (tieMatchUpsPct === Infinity || isNaN(tieMatchUpsPct)) tieMatchUpsPct = tieMatchUpsWon;

    const matchUpsWon = participantResults[participantId].matchUpsWon;
    const matchUpsLost = participantResults[participantId].matchUpsLost;
    const matchUpsTotal = matchUpsWon + matchUpsLost;
    let matchUpsPct = Math.round((matchUpsWon / matchUpsTotal) * 1000) / 1000;
    if (matchUpsPct === Infinity || isNaN(matchUpsPct)) matchUpsPct = matchUpsWon;

    const gamesWon = participantResults[participantId].gamesWon || 0;
    const gamesLost = participantResults[participantId].gamesLost || 0;
    const minimumExpectedGames = (perPlayer || 0) * (bracketSetsToWin || 0) * (bracketGamesForSet || 0);
    const gamesTotal = Math.max(minimumExpectedGames, gamesWon + gamesLost);
    let gamesPct = Math.round((gamesWon / gamesTotal) * 1000) / 1000;
    if (gamesPct === Infinity || isNaN(gamesPct)) gamesPct = 0;

    let pointsPct =
      Math.round((participantResults[participantId].pointsWon / participantResults[participantId].pointsLost) * 1000) /
      1000;
    if (pointsPct === Infinity || isNaN(pointsPct)) pointsPct = 0;

    participantResults[participantId].setsWon = setsWon;
    participantResults[participantId].setsLost = setsLost;
    participantResults[participantId].setsPct = setsPct;
    participantResults[participantId].tieMatchUpsWon = tieMatchUpsWon;
    participantResults[participantId].tieMatchUpsPct = tieMatchUpsPct;
    participantResults[participantId].matchUpsPct = matchUpsPct;
    participantResults[participantId].gamesWon = gamesWon;
    participantResults[participantId].gamesLost = gamesLost;
    participantResults[participantId].gamesPct = gamesPct;
    participantResults[participantId].pointsPct = pointsPct;
    participantResults[participantId].result =
      `${participantResults[participantId].matchUpsWon}/${participantResults[participantId].matchUpsLost}`;
  });
}
