import { matchUpFormatCode } from 'tods-matchup-format-code';
import { instanceCount } from '../../../../utilities/arrays';
import { determineTeamOrder } from './determineOrder';
import { getBaseCounts } from './getBaseCounts';

import { MISSING_MATCHUPS } from '../../../../constants/errorConditionConstants';

export function tallyParticipantResults({
  headToHeadPriority,
  matchUpFormat,
  matchUps = [],
  subOrderMap,
  perPlayer,
}) {
  if (!Array.isArray(matchUps)) return { error: MISSING_MATCHUPS };

  const parsedGroupMatchUpFormat = matchUpFormatCode.parse(matchUpFormat) || {};

  // if bracket is incomplete don't use expected matchUps perPlayer for calculating
  const relevantMatchUps = matchUps.filter(
    (matchUp) => matchUp.matchUpStatus !== 'BYE'
  );
  const bracketComplete =
    relevantMatchUps.filter((m) => m.winningSide !== undefined).length ===
    relevantMatchUps.length;
  if (!bracketComplete) perPlayer = 0;

  const { participantResults, disqualified } = getBaseCounts({
    matchUps: relevantMatchUps,
    matchUpFormat,
  });

  // the difference here is totals must be calcuulated using the expected
  // matchUp scoring format for the bracket, not the inidivudal matchUp formats
  const bestOfGames = parsedGroupMatchUpFormat.bestOf;
  const bracketSetsToWin = (bestOfGames && Math.ceil(bestOfGames / 2)) || 1;
  const bracketGamesForSet =
    parsedGroupMatchUpFormat.setFormat &&
    parsedGroupMatchUpFormat.setFormat.setTo;

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

  const order = determineTeamOrder({
    participantResults,
    disqualified,
    headToHeadPriority,
  });

  // do not calculate order if bracket is not complete
  if (bracketComplete && order) {
    const rankOrders = order.map(({ rankOrder }) => rankOrder);
    const rankOrdersCount = instanceCount(rankOrders);
    order.forEach((o) => {
      const result = participantResults[o.participantId];
      const rankOrderInstances = rankOrdersCount[o.rankOrder];

      result.GEMscore = o.GEMscore;
      if (o !== undefined && o.rankOrder !== undefined) {
        result.groupOrder = o.rankOrder;

        // subOrder is only assigned if there are ties
        if (rankOrderInstances > 1) {
          result.ties = rankOrderInstances;
          result.subOrder = subOrderMap[o.participantId];
        }
      }

      // calculate order for awarding points
      if (o !== undefined && o.pointsOrder !== undefined) {
        result.pointsOrder = o.pointsOrder;
      } else {
        result.pointsOrder = undefined;
      }
    });
  }

  return { participantResults };
}
