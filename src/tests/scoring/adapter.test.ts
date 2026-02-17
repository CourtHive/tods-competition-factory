/**
 * v4.0 Tests - v3 Adapter
 * 
 * Test that v3 API works through v4 adapter
 */

import { describe, test, expect } from 'vitest';
import { createV3Adapter } from '@Tools/scoring/v3Adapter';

describe('v3 Adapter', () => {
  test('should create match with v3 API', () => {
    const umo = createV3Adapter();
    const match = umo.Match({ matchUpFormat: 'SET3-S:6/TB7' });
    
    expect(match).toBeDefined();
    expect(match.score).toBeDefined();
    expect(match.addPoint).toBeDefined();
  });

  test('should score points with v3 API', () => {
    const umo = createV3Adapter();
    const match = umo.Match({ matchUpFormat: 'SET3-S:6/TB7' });
    
    match.addPoint(0);
    match.addPoint(1);
    match.addPoint(0);
    
    const score = match.score();
    expect(score.points).toBe('2-1');
  });

  test('should return v3-compatible score object', () => {
    const umo = createV3Adapter();
    const match = umo.Match({ matchUpFormat: 'SET3-S:6/TB7' });
    
    match.addPoint(0);
    
    const score = match.score();
    expect(score).toHaveProperty('counters');
    expect(score).toHaveProperty('points');
    expect(score).toHaveProperty('games');
    expect(score).toHaveProperty('sets');
    expect(score.counters.points).toEqual([1, 0]);
  });

  test('should handle scoreboard', () => {
    const umo = createV3Adapter();
    const match = umo.Match({ matchUpFormat: 'SET3-S:6/TB7' });
    
    match.addPoint(0);
    const scoreboard = match.scoreboard();
    
    expect(scoreboard).toBe('0-0 (15-0)');
  });

  test('should detect match completion', () => {
    const umo = createV3Adapter();
    const match = umo.Match({ matchUpFormat: 'SET1-S:1/TB7' });
    
    expect(match.complete()).toBe(false);
    
    // Win 1 game
    for (let i = 0; i < 4; i++) {
      match.addPoint(0);
    }
    
    expect(match.complete()).toBe(true);
    expect(match.winner()).toBe(0); // v3 uses 0-indexed
  });

  test('should chain addPoint calls', () => {
    const umo = createV3Adapter();
    const match = umo.Match({ matchUpFormat: 'SET3-S:6/TB7' });
    
    match.addPoint(0).addPoint(1).addPoint(0);
    
    const score = match.score();
    expect(score.counters.points).toEqual([2, 1]);
  });

  test('should handle addPoints batch', () => {
    const umo = createV3Adapter();
    const match = umo.Match({ matchUpFormat: 'SET3-S:6/TB7' });
    
    match.addPoints([0, 1, 0, 1]);
    
    const score = match.score();
    expect(score.counters.points).toEqual([2, 2]);
  });

  test('should score complete game', () => {
    const umo = createV3Adapter();
    const match = umo.Match({ matchUpFormat: 'SET3-S:6/TB7' });
    
    // Win game 4-0
    match.addPoint(0);
    match.addPoint(0);
    match.addPoint(0);
    match.addPoint(0);
    
    const score = match.score();
    expect(score.games).toBe('1-0');
  });

  test('should provide history', () => {
    const umo = createV3Adapter();
    const match = umo.Match({ matchUpFormat: 'SET3-S:6/TB7' });
    
    match.addPoint(0);
    match.addPoint(1);
    
    const points = match.history.points();
    expect(points).toHaveLength(2);
    expect(points[0].winner).toBe(0);
    expect(points[1].winner).toBe(1);
  });

  test('should handle reset', () => {
    const umo = createV3Adapter();
    const match = umo.Match({ matchUpFormat: 'SET3-S:6/TB7' });
    
    match.addPoint(0);
    match.addPoint(1);
    
    match.reset();
    
    const score = match.score();
    expect(score.points).toBe('0-0');
  });
});
