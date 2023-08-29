import {
  COMPETITIVE,
  DECISIVE,
  ROUTINE,
  WALKOVER,
} from '../../constants/statsConstants';

const add = (a, b) => (a || 0) + (b || 0);

export function getBand(spread, bandProfiles) {
  return (
    (isNaN(spread) && WALKOVER) ||
    (spread <= bandProfiles[DECISIVE] && DECISIVE) ||
    (spread <= bandProfiles[ROUTINE] && ROUTINE) ||
    COMPETITIVE
  );
}

export function getScoreComponents({ score }) {
  const sets = score?.sets || [];

  const games = sets.reduce(
    (p, c) => {
      p[0] += c.side1Score || 0;
      p[1] += c.side2Score || 0;
      return p;
    },
    [0, 0]
  );
  const stb = sets.reduce(
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
}

function gamesPercent(scoreComponents) {
  const minGames = Math.min(...scoreComponents.games);
  const maxGames = Math.max(...scoreComponents.games);
  return Math.round((minGames / maxGames) * 100);
}

export function pctSpread(pcts) {
  return pcts
    .map(gamesPercent)
    .sort()
    .map((p) => p.toFixed(2));
}
