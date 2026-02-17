/**
 * v3 Compatibility Tests
 * 
 * Run actual v3 tests against v4 adapter to verify compatibility
 */

import { describe, test, expect } from 'vitest';
import { createV3Adapter } from '@Tools/scoring/v3Adapter';

// Create adapter that mimics v3 umo
const umo = createV3Adapter();

describe('v3 Compatibility - Match Scoring', () => {
  test('should score a basic match', () => {
    const match = umo.Match({ matchUpFormat: 'SET3-S:6/TB7' });
    
    // Score first game
    match.addPoint(0);
    match.addPoint(0);
    match.addPoint(0);
    match.addPoint(0);
    
    const score = match.score();
    expect(score.games).toBe('1-0');
    expect(score.points).toBe('0-0');
  });

  test('should handle deuce', () => {
    const match = umo.Match({ matchUpFormat: 'SET3-S:6/TB7' });
    
    // Get to 40-40
    match.addPoint(0); // 15-0
    match.addPoint(0); // 30-0
    match.addPoint(0); // 40-0
    match.addPoint(1); // 40-15
    match.addPoint(1); // 40-30
    match.addPoint(1); // 40-40
    
    expect(match.scoreboard()).toContain('40-40');
  });

  test('should score a complete set', () => {
    const match = umo.Match({ matchUpFormat: 'SET3-S:6/TB7' });
    
    // Win 6 games to 0
    for (let game = 0; game < 6; game++) {
      for (let point = 0; point < 4; point++) {
        match.addPoint(0);
      }
    }
    
    const score = match.score();
    expect(score.sets).toBe('1-0');
  });

  test('should complete best of 3 match', () => {
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
  });

  test('should handle different point sequences', () => {
    const match = umo.Match({ matchUpFormat: 'SET3-S:6/TB7' });
    
    // Alternating points
    match.addPoint(0); // 15-0
    match.addPoint(1); // 15-15
    match.addPoint(0); // 30-15
    match.addPoint(1); // 30-30
    
    const score = match.score();
    expect(score.counters.points).toEqual([2, 2]);
  });

  test('should provide point history', () => {
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
});

describe('v3 Compatibility - Format Tests', () => {
  test('should handle SET1-S:4/TB7 format', () => {
    const match = umo.Match({ matchUpFormat: 'SET1-S:4/TB7' });
    
    // Win 4 games
    for (let game = 0; game < 4; game++) {
      for (let point = 0; point < 4; point++) {
        match.addPoint(0);
      }
    }
    
    expect(match.complete()).toBe(true);
  });

  test('should handle SET3-S:4NOAD format', () => {
    const match = umo.Match({ matchUpFormat: 'SET3-S:4NOAD' });
    
    // In No-AD, 40-40 then next point wins
    match.addPoint(0); // 15-0
    match.addPoint(0); // 30-0
    match.addPoint(0); // 40-0
    match.addPoint(1); // 40-15
    match.addPoint(1); // 40-30
    match.addPoint(1); // 40-40 (deuce)
    match.addPoint(0); // Game (no advantage needed)
    
    const score = match.score();
    expect(score.games).toBe('1-0');
  });
});

describe('v3 Compatibility - Edge Cases', () => {
  test('should handle match reset', () => {
    const match = umo.Match({ matchUpFormat: 'SET3-S:6/TB7' });
    
    match.addPoint(0);
    match.addPoint(0);
    
    match.reset();
    
    const score = match.score();
    expect(score.points).toBe('0-0');
    expect(match.history.points()).toHaveLength(0);
  });

  test('should handle chained addPoint calls', () => {
    const match = umo.Match({ matchUpFormat: 'SET3-S:6/TB7' });
    
    match
      .addPoint(0)
      .addPoint(1)
      .addPoint(0)
      .addPoint(0);
    
    const score = match.score();
    expect(score.counters.points).toEqual([3, 1]);
  });

  test('should handle addPoints batch', () => {
    const match = umo.Match({ matchUpFormat: 'SET3-S:6/TB7' });
    
    match.addPoints([0, 1, 0, 0, 1, 1]);
    
    const score = match.score();
    expect(score.counters.points).toEqual([3, 3]);
  });
});
