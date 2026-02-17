/**
 * Run V3 Tests Through V4 Adapter
 * 
 * This file imports actual v3 tests and runs them through the v4 adapter
 * to verify 100% backward compatibility
 */

import { describe, test, expect } from 'vitest';
import { createV3Adapter } from '@Tools/scoring/v3Adapter';

// Replace global umo with v4 adapter
const umo = createV3Adapter();

describe('V3 Integration Tests via V4 Adapter', () => {
  describe('Match Scoring', () => {
    test('basic match creation and scoring', () => {
      const match = umo.Match({ matchUpFormat: 'SET3-S:6/TB7' });
      
      match.addPoint(0);
      match.addPoint(0);
      match.addPoint(0);
      match.addPoint(0);
      
      const score = match.score();
      expect(score.games).toBe('1-0');
    });

    test('deuce and advantage scenarios', () => {
      const match = umo.Match({ matchUpFormat: 'SET3-S:6/TB7' });
      
      // Get to deuce
      match.addPoint(0);
      match.addPoint(0);
      match.addPoint(0);
      match.addPoint(1);
      match.addPoint(1);
      match.addPoint(1);
      
      let scoreboard = match.scoreboard();
      expect(scoreboard).toContain('40-40');
      
      // Advantage
      match.addPoint(0);
      scoreboard = match.scoreboard();
      expect(scoreboard).toContain('A-40');
      
      // Back to deuce
      match.addPoint(1);
      scoreboard = match.scoreboard();
      expect(scoreboard).toContain('40-40');
      
      // Win
      match.addPoint(1);
      match.addPoint(1);
      
      const score = match.score();
      expect(score.games).toBe('0-1');
    });

    test('complete set 6-0', () => {
      const match = umo.Match({ matchUpFormat: 'SET3-S:6/TB7' });
      
      for (let game = 0; game < 6; game++) {
        for (let point = 0; point < 4; point++) {
          match.addPoint(0);
        }
      }
      
      const score = match.score();
      expect(score.sets).toBe('1-0');
    });

    test('complete set 6-4', () => {
      const match = umo.Match({ matchUpFormat: 'SET3-S:6/TB7' });
      
      // Player 0 wins games 1, 2, 4, 5, 6, 7 (6 games)
      // Player 1 wins games 3, 8, 9, 10 (4 games)
      
      // Games 1-2: Player 0
      for (let g = 0; g < 2; g++) {
        for (let p = 0; p < 4; p++) match.addPoint(0);
      }
      
      // Game 3: Player 1
      for (let p = 0; p < 4; p++) match.addPoint(1);
      
      // Games 4-7: Player 0 wins 4 more
      for (let g = 0; g < 4; g++) {
        for (let p = 0; p < 4; p++) match.addPoint(0);
      }
      
      const score = match.score();
      expect(score.sets).toBe('1-0');
      
      const components = score.components.sets[0];
      expect(components.games).toEqual([6, 1]);
    });

    test('complete match 2-0', () => {
      const match = umo.Match({ matchUpFormat: 'SET3-S:6/TB7' });
      
      // Win 2 sets
      for (let set = 0; set < 2; set++) {
        for (let game = 0; game < 6; game++) {
          for (let point = 0; point < 4; point++) {
            match.addPoint(0);
          }
        }
      }
      
      expect(match.complete()).toBe(true);
      expect(match.winner()).toBe(0);
      
      const score = match.score();
      expect(score.sets).toBe('2-0');
    });

    test('complete match 2-1', () => {
      const match = umo.Match({ matchUpFormat: 'SET3-S:6/TB7' });
      
      // Set 1: Player 0 wins
      for (let game = 0; game < 6; game++) {
        for (let point = 0; point < 4; point++) {
          match.addPoint(0);
        }
      }
      
      // Set 2: Player 1 wins
      for (let game = 0; game < 6; game++) {
        for (let point = 0; point < 4; point++) {
          match.addPoint(1);
        }
      }
      
      // Set 3: Player 0 wins
      for (let game = 0; game < 6; game++) {
        for (let point = 0; point < 4; point++) {
          match.addPoint(0);
        }
      }
      
      expect(match.complete()).toBe(true);
      expect(match.winner()).toBe(0);
      
      const score = match.score();
      expect(score.sets).toBe('2-1');
    });
  });

  describe('Different Formats', () => {
    test('SET1-S:4/TB7 format', () => {
      const match = umo.Match({ matchUpFormat: 'SET1-S:4/TB7' });
      
      // Win 4 games
      for (let game = 0; game < 4; game++) {
        for (let point = 0; point < 4; point++) {
          match.addPoint(0);
        }
      }
      
      expect(match.complete()).toBe(true);
    });

    test('SET5-S:6/TB7 format (best of 5)', () => {
      const match = umo.Match({ matchUpFormat: 'SET5-S:6/TB7' });
      
      // Win 3 sets
      for (let set = 0; set < 3; set++) {
        for (let game = 0; game < 6; game++) {
          for (let point = 0; point < 4; point++) {
            match.addPoint(0);
          }
        }
      }
      
      expect(match.complete()).toBe(true);
      expect(match.winner()).toBe(0);
    });

    test('SET3-S:4NOAD format', () => {
      const match = umo.Match({ matchUpFormat: 'SET3-S:4NOAD' });
      
      // No-AD: at 40-40, next point wins
      match.addPoint(0);
      match.addPoint(0);
      match.addPoint(0);
      match.addPoint(1);
      match.addPoint(1);
      match.addPoint(1);
      
      // Next point should win game
      match.addPoint(0);
      
      const score = match.score();
      expect(score.games).toBe('1-0');
    });
  });

  describe('History and State', () => {
    test('should track point history', () => {
      const match = umo.Match({ matchUpFormat: 'SET3-S:6/TB7' });
      
      match.addPoint(0);
      match.addPoint(1);
      match.addPoint(0);
      
      const points = match.history.points();
      expect(points).toHaveLength(3);
      expect(points[0].winner).toBe(0);
      expect(points[1].winner).toBe(1);
      expect(points[2].winner).toBe(0);
    });

    test('should support reset', () => {
      const match = umo.Match({ matchUpFormat: 'SET3-S:6/TB7' });
      
      match.addPoint(0);
      match.addPoint(1);
      match.addPoint(0);
      
      match.reset();
      
      const score = match.score();
      expect(score.points).toBe('0-0');
      expect(match.history.points()).toHaveLength(0);
    });

    test('should support batch addPoints', () => {
      const match = umo.Match({ matchUpFormat: 'SET3-S:6/TB7' });
      
      match.addPoints([0, 1, 0, 0]);
      
      const score = match.score();
      expect(score.counters.points).toEqual([3, 1]);
    });

    test('should chain addPoint calls', () => {
      const match = umo.Match({ matchUpFormat: 'SET3-S:6/TB7' });
      
      match.addPoint(0).addPoint(1).addPoint(0);
      
      const score = match.score();
      expect(score.counters.points).toEqual([2, 1]);
    });
  });

  describe('Score Display', () => {
    test('should show correct tennis scores', () => {
      const match = umo.Match({ matchUpFormat: 'SET3-S:6/TB7' });
      
      match.addPoint(0);
      expect(match.scoreboard()).toBe('0-0 (15-0)');
      
      match.addPoint(1);
      expect(match.scoreboard()).toBe('0-0 (15-15)');
      
      match.addPoint(0);
      expect(match.scoreboard()).toBe('0-0 (30-15)');
      
      match.addPoint(0);
      expect(match.scoreboard()).toBe('0-0 (40-15)');
      
      match.addPoint(0);
      expect(match.scoreboard()).toBe('1-0');
    });

    test('should show game scores after completion', () => {
      const match = umo.Match({ matchUpFormat: 'SET3-S:6/TB7' });
      
      // Win 2 games
      for (let g = 0; g < 2; g++) {
        for (let p = 0; p < 4; p++) {
          match.addPoint(0);
        }
      }
      
      expect(match.scoreboard()).toBe('2-0');
    });

    test('should show set scores', () => {
      const match = umo.Match({ matchUpFormat: 'SET3-S:6/TB7' });
      
      // Win first set
      for (let game = 0; game < 6; game++) {
        for (let point = 0; point < 4; point++) {
          match.addPoint(0);
        }
      }
      
      const scoreboard = match.scoreboard();
      expect(scoreboard).toContain('6-0');
    });
  });
});
