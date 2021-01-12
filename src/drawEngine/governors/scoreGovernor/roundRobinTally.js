import {
  unique,
  indices,
  subSort,
  occurrences,
} from '../../../utilities/arrays';
import { matchUpFormatCode } from 'tods-matchup-format-code';
import { MISSING_MATCHUPS } from '../../../constants/errorConditionConstants';

function getSetsToWin(bestOfGames) {
  return (bestOfGames && Math.ceil(bestOfGames / 2)) || 1;
}
export function tallyParticipantResults({
  matchUps = [],
  perPlayer,
  matchUpFormat,
  headToHeadPriority,
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

  const disqualified = [];
  const participantResults = {};

  relevantMatchUps
    .filter((f) => f)
    .forEach((matchUp) => {
      const scoreString = matchUp.score?.scoreStringSide1;
      const parsedMatchUpFormat =
        matchUpFormatCode.parse(matchUp.matchUpFormat || matchUpFormat) || {};

      if (matchUp.winningSide !== undefined) {
        const winningParticipantId = getWinningSideId(matchUp);
        const losingParticipantId = getLosingSideId(matchUp);

        if (!winningParticipantId || !losingParticipantId) {
          console.log('no winner', { matchUp });
          // if there is an undefined winner/loser then the matchUp was cancelled
          const side1 = getSideId(matchUp, 0);
          const side2 = getSideId(matchUp, 1);
          if (side1) {
            checkInitializeParticipant(side1);
            participantResults[side1].matchUpsCancelled += 1;
          }
          if (side2) {
            checkInitializeParticipant(side2);
            participantResults[side2].matchUpsCancelled += 1;
          }
          return;
        }

        checkInitializeParticipant(winningParticipantId);
        checkInitializeParticipant(losingParticipantId);

        if (scoreString && disqualifyingScore(scoreString))
          disqualified.push(losingParticipantId);

        participantResults[winningParticipantId].matchUpsWon += 1;
        participantResults[losingParticipantId].matchUpsLost += 1;
        participantResults[losingParticipantId].defeats.push(
          winningParticipantId
        );
        participantResults[winningParticipantId].victories.push(
          losingParticipantId
        );

        const sets = matchUp.score?.sets || [];
        const setsTally = countSets({
          winner: 0,
          parsedMatchUpFormat,
          scoreString,
          sets,
        });
        participantResults[winningParticipantId].setsWon += setsTally[0];
        participantResults[winningParticipantId].setsLost += setsTally[1];
        participantResults[losingParticipantId].setsWon += setsTally[1];
        participantResults[losingParticipantId].setsLost += setsTally[0];

        const gamesTally = countGames({
          winner: 0,
          parsedMatchUpFormat,
          scoreString,
          sets,
        });
        participantResults[winningParticipantId].gamesWon += gamesTally[0];
        participantResults[winningParticipantId].gamesLost += gamesTally[1];
        participantResults[losingParticipantId].gamesWon += gamesTally[1];
        participantResults[losingParticipantId].gamesLost += gamesTally[0];

        const pointsTally = countPoints({ scoreString });
        participantResults[winningParticipantId].pointsWon += pointsTally[0];
        participantResults[winningParticipantId].pointsLost += pointsTally[1];
        participantResults[losingParticipantId].pointsWon += pointsTally[1];
        participantResults[losingParticipantId].pointsLost += pointsTally[0];
      } else {
        if (matchUp.sides)
          matchUp.sides.forEach((side) =>
            checkInitializeParticipant(side.participantId)
          );
      }
    });

  function checkInitializeParticipant(participantId) {
    if (!participantResults[participantId])
      participantResults[participantId] = {
        matchUpsWon: 0,
        matchUpsLost: 0,
        victories: [],
        defeats: [],
        matchUpsCancelled: 0,
        setsWon: 0,
        setsLost: 0,
        gamesWon: 0,
        gamesLost: 0,
        pointsWon: 0,
        pointsLost: 0,
      };
  }

  // the difference here is totals must be calcuulated using the expected
  // matchUp scoring format for the bracket, not the inidivudal matchUp formats
  const bracketSetsToWin = getSetsToWin(parsedGroupMatchUpFormat.bestOf);
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

  const order = determineTeamOrder(participantResults);

  if (order) {
    const rankOrderList = order.map((o) => o.rankOrder);

    order.forEach((o) => {
      participantResults[o.id].GEMscore = o.GEMscore;
      if (o !== undefined && o.rankOrder !== undefined) {
        participantResults[o.id].groupOrder = o.rankOrder;
        if (
          occurrences(o.rankOrder, rankOrderList) > 1 &&
          participantResults[o.id].subOrder === undefined
        ) {
          participantResults[o.id].subOrder = 0;
        } else if (occurrences(o.rankOrder, rankOrderList) === 1) {
          participantResults[o.id].subOrder = undefined;
        }
      }

      // calculate order for awarding points
      if (o !== undefined && o.pointsOrder !== undefined) {
        participantResults[o.id].pointsOrder = o.pointsOrder;
      } else {
        participantResults[o.id].pointsOrder = undefined;
      }
    });
  }

  return { participantResults };

  function walkedOver(scoreString) {
    return /W/.test(scoreString) && /O/.test(scoreString);
  }
  function defaulted(scoreString) {
    return /DEF/.test(scoreString);
  }
  function retired(scoreString) {
    return /RET/.test(scoreString);
  }
  function disqualifyingScore(scoreString) {
    return walkedOver(scoreString) || defaulted(scoreString);
  }

  function countSets({ scoreString, sets, winner, parsedMatchUpFormat }) {
    const setsToWin = getSetsToWin(parsedMatchUpFormat?.bestOf || 3);

    const setsTally = [0, 0];
    if (!scoreString) return setsTally;
    if (disqualifyingScore(scoreString)) {
      if (winner !== undefined && setsToWin) setsTally[winner] = setsToWin;
    } else {
      if (sets) {
        sets.forEach((set) => {
          const { winningSide } = set;
          if (winningSide) setsTally[winningSide - 1] += 1;
        });
      }
    }
    if (retired(scoreString) && winner !== undefined && setsToWin) {
      // if the loser has setsToWin then last set was incomplete and needs to be subtracted from loser
      if (+setsTally[1 - winner] === setsToWin) setsTally[1 - winner] -= 1;
      setsTally[winner] = setsToWin;
    }
    return setsTally;
  }

  function countPoints({ scoreString }) {
    const pointsTally = [0, 0];
    if (!scoreString) return pointsTally;
    const setScores = scoreString.split(' ');
    setScores.forEach((setScore) => {
      const scores = /\d+\/\d+/.test(setScore)
        ? setScore.split('/').map((s) => /\d+/.exec(s)[0])
        : [0, 0];
      if (scores) {
        pointsTally[0] += parseInt(scores[0]);
        pointsTally[1] += parseInt(scores[1]);
      }
    });
    return pointsTally;
  }

  function countGames({ scoreString, sets, winner, parsedMatchUpFormat }) {
    let side1Score = 0,
      side2Score = 0;
    const setsToWin = getSetsToWin(parsedMatchUpFormat?.bestOf || 3);
    const gamesForSet = parsedMatchUpFormat?.setFormat?.setTo || 6;
    const tiebreakAt = parsedMatchUpFormat?.setFormat?.tiebreakAt || 6;
    if (!scoreString) return [side1Score, side2Score];

    const minimumGameWins = setsToWin * gamesForSet;
    const gamesTally = [[], []];
    if (disqualifyingScore(scoreString)) {
      if (winner !== undefined && setsToWin && gamesForSet) {
        gamesTally[winner].push(minimumGameWins);
      }
    } else {
      if (sets) {
        sets.forEach((set) => {
          ({ side1Score, side2Score } = set);
          gamesTally[0].push(parseInt(side1Score || 0));
          gamesTally[1].push(parseInt(side2Score || 0));
        });
      }
    }
    if (
      retired(scoreString) &&
      winner !== undefined &&
      setsToWin &&
      gamesForSet
    ) {
      const setsTally = countSets({
        scoreString,
        sets,
        winner,
        parsedMatchUpFormat,
      });
      const totalSets = setsTally.reduce((a, b) => a + b, 0);
      const loserLeadSet = gamesTally
        .map((g) => g[winner] <= g[1 - winner])
        .reduce((a, b) => a + b, 0);
      // if sets where loser lead > awarded sets, adjust last game to winner
      if (loserLeadSet > setsTally[1 - winner]) {
        const talliedGames = gamesTally[winner].length;
        const complement = getComplement(
          gamesTally[1 - winner][talliedGames - 1]
        );
        if (complement) gamesTally[winner][talliedGames - 1] = complement;
      }
      // if the total # of sets is less than gamesTally[x].length award gamesForSet to winner
      if (totalSets > gamesTally[winner].length) {
        gamesTally[winner].push(gamesForSet);
      }
    }
    const result = [
      gamesTally[0].reduce((a, b) => a + b, 0),
      gamesTally[1].reduce((a, b) => a + b, 0),
    ];
    if (winner !== undefined && result[winner] < minimumGameWins)
      result[winner] = minimumGameWins;
    return result;

    function getComplement(value) {
      if (!parsedMatchUpFormat || value === '') return;
      if (+value === tiebreakAt - 1 || +value === tiebreakAt)
        return parseInt(tiebreakAt || 0) + 1;
      if (+value < tiebreakAt) return gamesForSet;
      return tiebreakAt;
    }
  }

  function determineTeamOrder(participantResults) {
    const participantIds = Object.keys(participantResults);
    const participantsCount = participantIds.length;

    // order is an array of objects formatted for processing by ties()
    const order = participantIds.reduce((arr, teamId, i) => {
      arr.push({ id: teamId, i, results: participantResults[teamId] });
      return arr;
    }, []);
    let complete = order.filter(
      (o) =>
        participantsCount - 1 ===
        o.results.matchUpsWon +
          o.results.matchUpsLost +
          o.results.matchUpsCancelled
    );

    // if not all opponents have completed their matchUps, no orders are assigned
    if (participantsCount !== complete.length) {
      return;
    }

    complete.forEach((p) => (p.orderHash = getOrderHash(p)));
    complete.forEach((p) => (p.GEMscore = getRatioHash(p)));

    // START ORDER HASH
    if (headToHeadPriority) {
      complete.sort(
        (a, b) => (b.results.matchUpsWon || 0) - (a.results.matchUpsWon || 0)
      );
      const wins = complete.map((p) => p.results.matchUpsWon);
      const counts = unique(wins);
      counts.forEach((count) => {
        const i = indices(count, wins);
        if (i.length && i.length > 1) {
          const start = Math.min(...i);
          const end = Math.max(...i);
          const n = end - start + 1;
          if (n === 2) {
            complete = subSort(complete, start, n, h2hOrder);
          } else {
            complete = subSort(complete, start, n, orderHashSort);
          }
        }
      });
    } else {
      complete.sort(orderHashSort);
    }

    const hashOrder = unique(complete.map((c) => c.orderHash));
    complete.forEach((p) => (p.hashOrder = hashOrder.indexOf(p.orderHash) + 1));

    // now account for equivalent hashOrder
    let rankOrder = 0;
    let rankHash = undefined;
    complete.forEach((p, i) => {
      if (p.orderHash !== rankHash) {
        rankOrder = i + 1;
        rankHash = p.orderHash;
      }
      p.rankOrder = rankOrder;
    });
    // END ORDER HASH

    // START RATIO HASH
    if (headToHeadPriority) {
      complete.sort(
        (a, b) => (b.results.matchUpsWon || 0) - (a.results.matchUpsWon || 0)
      );
      const wins = complete.map((p) => p.results.matchUpsWon);
      const counts = unique(wins);
      counts.forEach((count) => {
        const i = indices(count, wins);
        if (i.length && i.length > 1) {
          const start = Math.min(...i);
          const end = Math.max(...i);
          const n = end - start + 1;
          if (n === 2) {
            complete = subSort(complete, start, n, h2hRatio);
          } else {
            complete = subSort(complete, start, n, ratioHashSort);
          }
        }
      });
    } else {
      complete.sort(ratioHashSort);
    }

    const ratioOrder = unique(complete.map((c) => c.GEMscore));
    complete.forEach(
      (p) => (p.ratioOrder = ratioOrder.indexOf(p.GEMscore) + 1)
    );

    // pointsOrder is used for awarding points and may differ from
    // rankOrder if a player unable to advance due to walkover
    let pointsOrder = 0;
    let GEMscore = undefined;
    complete.forEach((p, i) => {
      if (p.GEMscore !== GEMscore) {
        pointsOrder = i + 1;
        GEMscore = p.GEMscore;
      }
      p.pointsOrder = pointsOrder;
    });
    // END RATIO HASH

    return complete;

    function ratioHashSort(a, b) {
      return b.GEMscore - a.GEMscore;
    }
    function orderHashSort(a, b) {
      return b.orderHash - a.orderHash;
    }
    function h2hRatio(a, b) {
      const side1Head2Head = a.results.victories.indexOf(b.id) >= 0;
      const side2Head2Head = b.results.victories.indexOf(a.id) >= 0;
      if (side1Head2Head || side2Head2Head) {
        return side2Head2Head ? 1 : -1;
      }
      return b.GEMscore - a.GEMscore;
    }

    function h2hOrder(a, b) {
      const side1Head2Head = a.results.victories.indexOf(b.id) >= 0;
      const side2Head2Head = b.results.victories.indexOf(a.id) >= 0;
      if (side1Head2Head || side2Head2Head) {
        return side2Head2Head ? 1 : -1;
      }
      return b.orderHash - a.orderHash;
    }

    function getOrderHash(p) {
      if (disqualified.indexOf(p.id) >= 0) return 0;
      return getRatioHash(p);
    }
    function getRatioHash(p) {
      let rh;
      if (headToHeadPriority) {
        rh =
          p.results.matchUpsRatio * Math.pow(10, 16) +
          p.results.setsRatio * Math.pow(10, 12) +
          p.results.gamesDifference * Math.pow(10, 8) +
          p.results.pointsRatio * Math.pow(10, 3);
      } else {
        rh =
          p.results.matchUpsRatio * Math.pow(10, 16) +
          p.results.setsRatio * Math.pow(10, 12) +
          p.results.gamesRatio * Math.pow(10, 8) +
          p.results.pointsRatio * Math.pow(10, 3);
      }
      return rh;
    }
  }
}

function getWinningSideId(matchUp) {
  const winnerIndex = matchUp.winningSide - 1;
  return getSideId(matchUp, winnerIndex);
}

function getLosingSideId(matchUp) {
  const loserIndex = 1 - (matchUp.winningSide - 1);
  return getSideId(matchUp, loserIndex);
}

function getSideId(matchUp, index) {
  if (!matchUp || !matchUp.sides) {
    console.log('no sides:', { matchUp });
    return 'foo';
  }
  const Side = matchUp.sides[index];
  if (!Side) {
    console.log('No Side', { matchUp, index });
    return 'foo';
  }
  return Side.participantId;
}

/*
function playersHash(players) {
  return players
    .map(p => p && p.id)
    .filter(f => f)
    .sort()
    .join('-');
}

// "classic" code
export function tallyBracketAndModifyPlayers({
  matchUps,
  teams,
  perPlayer,
  reset,
  matchUpFormat,
  headToHeadPriority,
}) {
  if (!matchUps || !matchUps.length) return;
  const participantResults = {};

  perPlayer = perPlayer || (teams && teams.length - 1) || 1;
  const tbr = tallyParticipantResults({
    matchUps,
    perPlayer,
    matchUpFormat,
    headToHeadPriority,
  });

  const instanceCount = values =>
    values.reduce((a, c) => {
      // eslint-disable-next-line
      a[c]++ ? 0 : (a[c] = 1);
      return a;
    }, {});
  const qordz = Object.keys(tbr.participantResults).map(
    t => tbr.participantResults[t].groupOrder
  );
  const ic = instanceCount(qordz);

  const validForSubOrder = Object.keys(ic).reduce(
    (p, c) => (ic[c] > 1 ? p.concat(parseInt(c)) : p),
    []
  );

  teams.forEach(team => {
    const participantId = playersHash(team);
    if (tbr.participantResults[participantId]) {
      team.forEach(player => {
        const participant = {};
        const participantId = player.id;

        participant.groupOrder =
          tbr.participantResults[participantId].groupOrder;

        if (reset) {
          // in this case subOrder is overridden
          participant.subOrder = tbr.participantResults[participantId].subOrder;
        } else {
          // in this context subOrder give preference to existing value
          participant.subOrder =
            (validForSubOrder.indexOf(participant.groupOrder) >= 0 &&
              participant.subOrder) ||
            tbr.participantResults[participantId].subOrder;
        }

        participant.pointsOrder =
          tbr.participantResults[participantId].pointsOrder;
        participant.results = {
          matchUpsWon: tbr.participantResults[participantId].matchUpsWon,
          matchUpsLost: tbr.participantResults[participantId].matchUpsLost,
          setsWon: tbr.participantResults[participantId].setsWon,
          setsLost: tbr.participantResults[participantId].setsLost,
          gamesWon: tbr.participantResults[participantId].gamesWon,
          gamesLost: tbr.participantResults[participantId].gamesLost,
          pointsWon: tbr.participantResults[participantId].pointsWon,
          pointsLost: tbr.participantResults[participantId].pointsLost,

          matchUpsRatio: tbr.participantResults[participantId].matchUpsRatio,
          setsRatio: tbr.participantResults[participantId].setsRatio,
          gamesRatio: tbr.participantResults[participantId].gamesRatio,
          pointsRatio: tbr.participantResults[participantId].pointsRatio,

          GEMscore: tbr.participantResults[participantId].GEMscore,
        };
        participant.result = tbr.participantResults[participantId].result;
        participant.games = tbr.participantResults[participantId].games;
        participantResults[participantId] = participant;
      });
    }
  });

  return participantResults;
}
*/
