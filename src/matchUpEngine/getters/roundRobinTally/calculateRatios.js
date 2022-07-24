import { parse } from '../../governors/matchUpFormatGovernor/parse';

export function calculateRatios({
  participantResults,
  matchUpFormat,
  perPlayer,
}) {
  const parsedGroupMatchUpFormat =
    (matchUpFormat && parse(matchUpFormat)) || {};
  const bestOfGames = parsedGroupMatchUpFormat.bestOf;
  const bracketSetsToWin = (bestOfGames && Math.ceil(bestOfGames / 2)) || 1;
  const bracketGamesForSet = parsedGroupMatchUpFormat.setFormat?.setTo;

  Object.keys(participantResults).forEach((participantId) => {
    const setsWon = participantResults[participantId].setsWon;
    const setsLost = participantResults[participantId].setsLost;
    const setsTotal = perPlayer * (bracketSetsToWin || 0) || setsWon + setsLost;
    let setsRatio = Math.round((setsWon / setsTotal) * 1000) / 1000;
    if (setsRatio === Infinity || isNaN(setsRatio)) setsRatio = setsTotal;

    const tieMatchUpsWon = participantResults[participantId].matchUpsWon;
    const tieMatchUpsLost = participantResults[participantId].matchUpsLost;
    const tieMatchUpsTotal = tieMatchUpsWon + tieMatchUpsLost;
    let tieMatchUpsRatio =
      Math.round((tieMatchUpsWon / tieMatchUpsTotal) * 1000) / 1000;
    if (tieMatchUpsRatio === Infinity || isNaN(tieMatchUpsRatio))
      tieMatchUpsRatio = tieMatchUpsWon;

    const matchUpsWon = participantResults[participantId].matchUpsWon;
    const matchUpsLost = participantResults[participantId].matchUpsLost;
    const matchUpsTotal = matchUpsWon + matchUpsLost;
    let matchUpsRatio = Math.round((matchUpsWon / matchUpsTotal) * 1000) / 1000;
    if (matchUpsRatio === Infinity || isNaN(matchUpsRatio))
      matchUpsRatio = matchUpsWon;

    const gamesWon = participantResults[participantId].gamesWon || 0;
    const gamesLost = participantResults[participantId].gamesLost || 0;
    const minimumExpectedGames =
      (perPlayer || 0) * (bracketSetsToWin || 0) * (bracketGamesForSet || 0);
    const gamesTotal = Math.max(minimumExpectedGames, gamesWon + gamesLost);
    let gamesRatio = Math.round((gamesWon / gamesTotal) * 1000) / 1000;
    if (gamesRatio === Infinity || isNaN(gamesRatio)) gamesRatio = 0;

    let pointsRatio =
      Math.round(
        (participantResults[participantId].pointsWon /
          participantResults[participantId].pointsLost) *
          1000
      ) / 1000;
    if (pointsRatio === Infinity || isNaN(pointsRatio)) pointsRatio = 0;

    participantResults[participantId].setsRatio = setsRatio;
    participantResults[participantId].tieMatchUpsRatio = tieMatchUpsRatio;
    participantResults[participantId].matchUpsRatio = matchUpsRatio;
    participantResults[participantId].gamesRatio = gamesRatio;
    participantResults[participantId].pointsRatio = pointsRatio;
    participantResults[
      participantId
    ].result = `${participantResults[participantId].matchUpsWon}/${participantResults[participantId].matchUpsLost}`;
    participantResults[
      participantId
    ].games = `${participantResults[participantId].gamesWon}/${participantResults[participantId].gamesLost}`;
  });
}
