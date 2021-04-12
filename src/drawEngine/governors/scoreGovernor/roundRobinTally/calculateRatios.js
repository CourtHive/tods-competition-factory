import { matchUpFormatCode } from 'tods-matchup-format-code';

export function calculateRatios({
  participantResults,
  matchUpFormat,
  perPlayer,
}) {
  const parsedGroupMatchUpFormat =
    (matchUpFormat && matchUpFormatCode.parse(matchUpFormat)) || {};
  const bestOfGames = parsedGroupMatchUpFormat.bestOf;
  const bracketSetsToWin = (bestOfGames && Math.ceil(bestOfGames / 2)) || 1;
  const bracketGamesForSet = parsedGroupMatchUpFormat.setFormat?.setTo;

  Object.keys(participantResults).forEach((participantId) => {
    const setsNumerator = participantResults[participantId].setsWon;
    const setsDenominator = participantResults[participantId].setsLost;
    const setsTotal = perPlayer * (bracketSetsToWin || 0) || setsNumerator;
    let setsRatio = Math.round((setsNumerator / setsDenominator) * 1000) / 1000;
    if (setsRatio === Infinity || isNaN(setsRatio)) setsRatio = setsTotal;

    const matchesNumerator = participantResults[participantId].matchUpsWon;
    const matchesDenominator = participantResults[participantId].matchUpsLost;
    let matchUpsRatio =
      Math.round((matchesNumerator / matchesDenominator) * 1000) / 1000;
    if (matchUpsRatio === Infinity || isNaN(matchUpsRatio))
      matchUpsRatio = matchesNumerator;

    const gamesNumerator = participantResults[participantId].gamesWon;
    const gamesDenominator = participantResults[participantId].gamesLost;
    const gamesTotal =
      perPlayer * (bracketSetsToWin || 0) * (bracketGamesForSet || 0) ||
      gamesNumerator;
    let gamesRatio =
      Math.round((gamesNumerator / gamesDenominator) * 1000) / 1000;
    if (gamesRatio === Infinity || isNaN(gamesRatio)) {
      gamesRatio = gamesTotal;
    }
    const gamesDifference =
      gamesDenominator >= gamesNumerator
        ? 0
        : gamesNumerator - gamesDenominator;

    let pointsRatio =
      Math.round(
        (participantResults[participantId].pointsWon /
          participantResults[participantId].pointsLost) *
          1000
      ) / 1000;
    if (pointsRatio === Infinity || isNaN(pointsRatio)) pointsRatio = 0;

    participantResults[participantId].setsRatio = setsRatio;
    participantResults[participantId].matchUpsRatio = matchUpsRatio;
    participantResults[participantId].gamesRatio = gamesRatio;
    participantResults[participantId].gamesDifference = gamesDifference;
    participantResults[participantId].pointsRatio = pointsRatio;
    participantResults[
      participantId
    ].result = `${participantResults[participantId].matchUpsWon}/${participantResults[participantId].matchUpsLost}`;
    participantResults[
      participantId
    ].games = `${participantResults[participantId].gamesWon}/${participantResults[participantId].gamesLost}`;
  });
}
