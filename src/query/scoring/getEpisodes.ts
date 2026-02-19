/**
 * getEpisodes - Transform point history into structured episodes
 *
 * Converts flat point history into enriched episodes with game/set/match
 * context. Each episode represents a single point with full contextual
 * information about game boundaries, set boundaries, and points needed
 * at each level.
 *
 * Ported from scoringVisualizations buildEpisodes() to provide this
 * functionality directly from the engine.
 */

import type {
  MatchUp,
  Episode,
  EpisodePoint,
  EpisodeGame,
  EpisodeSet,
  EpisodeNeeded,
} from '@Types/scoring/types';

/**
 * Build episodes from matchUp point history
 *
 * @param matchUp - Current matchUp state (with history.points populated)
 * @returns Array of episodes, one per point
 */
export function getEpisodes(matchUp: MatchUp): Episode[] {
  if (!matchUp) return [];
  const points = matchUp.history?.points;
  if (!points || points.length === 0) return [];

  const episodes: Episode[] = [];

  for (let i = 0; i < points.length; i++) {
    const point = points[i];
    const nextPoint = i < points.length - 1 ? points[i + 1] : undefined;

    // Use v3-compatible set/game metadata from point decorations
    const pointSet = (point as any).set ?? 0;
    const pointGame = (point as any).game ?? 0;
    const pointNumber = (point as any).number ?? 0;

    // Detect if this point completed a game
    // A game is complete if the next point is in a different game or set,
    // OR if the match is complete and this is the last point
    const nextSet = nextPoint ? ((nextPoint as any).set ?? 0) : undefined;
    const nextGame = nextPoint ? ((nextPoint as any).game ?? 0) : undefined;
    const isLastPoint = i === points.length - 1;
    const gameComplete = isLastPoint
      ? matchUp.matchUpStatus === 'COMPLETED' || (nextSet === undefined && nextGame === undefined)
      : (nextSet !== pointSet || nextGame !== pointGame);

    // Detect if this point completed a set
    const setComplete = isLastPoint
      ? matchUp.matchUpStatus === 'COMPLETED' || false
      : nextPoint !== undefined && nextSet !== pointSet;

    // Determine game winner if game is complete
    let gameWinner: 0 | 1 | undefined;
    if (gameComplete) {
      // The winner of the game is the winner of the last point in the game
      // (for standard tennis, the person who won game point)
      gameWinner = point.winner;
    }

    // Determine set winner if set is complete
    let setWinner: 0 | 1 | undefined;
    if (setComplete) {
      const currentSetObj = matchUp.score.sets[pointSet];
      if (currentSetObj?.winningSide !== undefined) {
        setWinner = (currentSetObj.winningSide - 1) as 0 | 1;
      }
    }

    // Build needed context from point decorations
    const needed: EpisodeNeeded = {};
    if (point.pointsToGame) needed.pointsToGame = point.pointsToGame;
    if (point.pointsToSet) needed.pointsToSet = point.pointsToSet;
    if (point.pointsToMatch) needed.pointsToMatch = point.pointsToMatch;
    if (point.gamesToSet) needed.gamesToSet = point.gamesToSet;
    if (point.isBreakpoint !== undefined) needed.isBreakpoint = point.isBreakpoint;

    // Determine next server
    const nextService = nextPoint?.server ?? point.server ?? 0;

    // Detect tiebreak - check if this set has isTiebreakOnly flag
    // or if the game scores indicate a tiebreak within a standard set
    const currentSetObj = matchUp.score.sets[pointSet];
    const isTiebreak = !!(
      currentSetObj?.isTiebreakOnly ||
      // In a standard set, detect tiebreak by checking if game scores are equal at tiebreakAt
      (pointGame > 0 && currentSetObj &&
        currentSetObj.side1Score !== undefined &&
        currentSetObj.side2Score !== undefined &&
        !currentSetObj.isTiebreakOnly)
    );

    const episodePoint: EpisodePoint = {
      index: i,
      number: pointNumber,
      winner: point.winner,
      server: point.server,
      score: point.score,
      result: point.result,
    };

    const episodeGame: EpisodeGame = {
      index: pointGame,
      isTiebreak,
      complete: gameComplete,
      winner: gameWinner,
    };

    const episodeSet: EpisodeSet = {
      index: pointSet,
      complete: setComplete,
      winner: setWinner,
    };

    const episode: Episode = {
      action: 'addPoint',
      point: episodePoint,
      game: episodeGame,
      set: episodeSet,
      needed,
      nextService,
      result: point.result,
      complete: isLastPoint && matchUp.matchUpStatus === 'COMPLETED',
    };

    episodes.push(episode);
  }

  return episodes;
}
