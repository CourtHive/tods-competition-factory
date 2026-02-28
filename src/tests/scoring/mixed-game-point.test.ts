/**
 * Test: Mixed addGame + addPoint scenario
 *
 * Verifies engine state when games are added via addGame() followed by
 * point-by-point play. Exercises the data that buildEpisodes relies on.
 */

import { ScoringEngine } from '@Assemblies/engines/scoring/ScoringEngine';
import { describe, test, expect } from 'vitest';

/** Helper: win a game by playing 4 points (no-deuce scenario) */
function winGameByPoints(engine: ScoringEngine, winner: 0 | 1) {
  for (let i = 0; i < 4; i++) {
    engine.addPoint({ winner });
  }
}

describe('Mixed addGame + addPoint', () => {
  test('addGame then win a game via points: state is consistent', () => {
    const engine = new ScoringEngine({ matchUpFormat: 'SET3-S:6/TB7' });

    // Step 1: Add a game for player 0
    engine.addGame({ winner: 0 });

    const scoreAfterAddGame = engine.getScore();
    expect(scoreAfterAddGame.games).toEqual([1, 0]);

    // Step 2: Win a full game via points for player 0
    winGameByPoints(engine, 0);

    const state = engine.getState();
    const score = engine.getScore();

    // After addGame(0) + 4 winning points → 2-0
    expect(score.games).toEqual([2, 0]);
    expect(state.score.sets[0].side1Score).toBe(2);
    expect(state.score.sets[0].side2Score).toBe(0);

    // Check point metadata: points should be in the second game (index 1)
    const points = state.history?.points || [];
    expect(points.length).toBe(4);

    // All points belong to game index 1 (addGame took game 0)
    points.forEach((point: any) => {
      expect(point.game).toBe(1);
      expect(point.set).toBe(0);
    });

    // Check unified timeline entries
    const entries = state.history?.entries || [];
    expect(entries.length).toBe(5); // 1 game + 4 points
    expect(entries[0].type).toBe('game');
    entries.slice(1).forEach((entry: any) => {
      expect(entry.type).toBe('point');
    });
  });

  test('addGame then points: getEpisodes reflects correct game indices', () => {
    const engine = new ScoringEngine({ matchUpFormat: 'SET3-S:6/TB7' });

    engine.addGame({ winner: 0 });
    winGameByPoints(engine, 0);

    // Use getEpisodes from the engine
    const episodes = engine.getEpisodes();
    expect(episodes.length).toBe(4);

    // All episodes should reference game index 1
    episodes.forEach((ep: any) => {
      expect(ep.game.index ?? ep.point.game).toBe(1);
    });

    // The last episode should indicate game completion
    const lastEpisode = episodes[episodes.length - 1];
    expect(lastEpisode.game.complete).toBe(true);
  });

  test('addGame p1 + addGame p2 + points p1: game index and scores correct', () => {
    const engine = new ScoringEngine({ matchUpFormat: 'SET3-S:6/TB7' });

    // addGame for player 0, addGame for player 1 → 1-1
    engine.addGame({ winner: 0 });
    engine.addGame({ winner: 1 });
    expect(engine.getScore().games).toEqual([1, 1]);

    // Play a full game via points for player 0 → 2-1
    winGameByPoints(engine, 0);

    const state = engine.getState();
    const score = engine.getScore();

    expect(score.games).toEqual([2, 1]);
    expect(state.score.sets[0].side1Score).toBe(2);
    expect(state.score.sets[0].side2Score).toBe(1);

    // Points should be in game index 2 (0-indexed: game 0=addGame p1, game 1=addGame p2, game 2=points)
    const points = state.history?.points || [];
    expect(points.length).toBe(4);
    points.forEach((point: any) => {
      expect(point.set).toBe(0);
      expect(point.game).toBe(2);
    });

    // Entries: 2 game entries + 4 point entries
    const entries = state.history?.entries || [];
    expect(entries.length).toBe(6);
    expect(entries[0].type).toBe('game');
    expect(entries[1].type).toBe('game');
    entries.slice(2).forEach((entry: any) => {
      expect(entry.type).toBe('point');
    });
  });

  test('addSet then addGame then points: score data is correct', () => {
    const engine = new ScoringEngine({ matchUpFormat: 'SET3-S:6/TB7' });

    // Add a full set 6-0 for player 0
    engine.addSet({ side1Score: 6, side2Score: 0, winningSide: 1 });

    // Add 2 games in set 2
    engine.addGame({ winner: 0 });
    engine.addGame({ winner: 0 });

    // Play a game via points in set 2
    winGameByPoints(engine, 0);

    const state = engine.getState();
    const score = engine.getScore();

    // Set 1: 6-0 complete
    expect(state.score.sets[0].side1Score).toBe(6);
    expect(state.score.sets[0].winningSide).toBe(1);

    // Set 2: 3-0 (2 addGame + 1 point-based)
    expect(score.games).toEqual([3, 0]);
    expect(state.score.sets[1].side1Score).toBe(3);

    // Points should be in set 1 (0-indexed), game 2
    const points = state.history?.points || [];
    expect(points.length).toBe(4);
    points.forEach((point: any) => {
      expect(point.set).toBe(1);
      expect(point.game).toBe(2);
    });
  });
});
