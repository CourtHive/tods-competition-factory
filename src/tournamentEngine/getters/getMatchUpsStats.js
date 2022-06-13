import { MISSING_MATCHUPS } from '../../constants/errorConditionConstants';
import { SUCCESS } from '../../constants/resultConstants';

import {
  COMPETITIVE,
  DECISIVE,
  RETIRED,
  ROUTINE,
  WALKOVER,
} from '../../constants/statsConstants';

export function getMatchUpsStats({
  bands = { [DECISIVE]: 20, [ROUTINE]: 50 },
  matchUps,
}) {
  if (!Array.isArray(matchUps)) return { error: MISSING_MATCHUPS };

  let categories = {
    d: DECISIVE,
    c: COMPETITIVE,
    r: ROUTINE,
    w: WALKOVER,
  };

  const add = (a, b) => (a || 0) + (b || 0);
  const relevantMatchUps = matchUps.filter(({ winningSide }) => winningSide);

  let gamesMap = relevantMatchUps.map(({ score }) => {
    const sets = score?.sets || [];

    const games = sets.reduce(
      (p, c) => {
        p[0] += c.side1Score || 0;
        p[1] += c.side2Score || 0;
        return p;
      },
      [0, 0]
    );
    let stb = sets.reduce(
      (p, c) => {
        p[0] += c.side1TiebreakScore || 0;
        p[1] += c.side2TiebreakScore || 0;
        return p;
      },
      [0, 0]
    );

    // add an extra game to the winner of tiebreak
    if (stb.reduce(add)) {
      games[stb[0] > stb[1] ? 0 : 1] += 1;
    }

    return { sets, games, score };
  });

  const sortem = (p, c) => {
    let band = isNaN(c)
      ? 'w'
      : c <= bands[DECISIVE]
      ? 'd'
      : c <= bands[ROUTINE]
      ? 'r'
      : 'c';
    p[band] += 1;
    return p;
  };

  const pctspd = pctSpread(gamesMap).reduce((p, c) => sortem(p, c), {
    c: 0,
    r: 0,
    d: 0,
    w: 0,
  });
  const total = Object.keys(pctspd).reduce((a, k) => (pctspd[k] || 0) + a, 0);

  const matchUpStats = Object.keys(pctspd).map((k) => ({
    [categories[k]]: (pctspd[k] / total).toFixed(4) * 100,
  }));

  const retiredCount = relevantMatchUps.filter(
    ({ matchUpStatus }) => matchUpStatus === RETIRED
  );

  matchUpStats.push({
    [RETIRED]: (retiredCount / total).toFixed(4) * 100,
  });

  return { matchUpStats: Object.assign({}, ...matchUpStats), ...SUCCESS };
}

function gamesPct(match_results) {
  let minGames = Math.min(...match_results.games);
  let maxGames = Math.max(...match_results.games);
  let pct = Math.round((minGames / maxGames) * 100);
  return pct;
}

export function pctSpread(pcts) {
  return pcts
    .map(gamesPct)
    .sort()
    .map((p) => p.toFixed(2));
}
