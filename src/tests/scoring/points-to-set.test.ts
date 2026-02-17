/**
 * Test for needed.points_to_set calculation
 * 
 * Verifies that V4 adapter correctly calculates points_to_set for visualization
 */

import { describe, test, expect } from 'vitest';
import { createV3Adapter } from '@Tools/scoring/v3Adapter';

describe('points_to_set calculation', () => {
  test('should calculate points_to_set for each point in match', () => {
    const umo = createV3Adapter();
    const match = umo.Match({ matchUpFormat: 'SET3-S:6/TB7' });
    
    match.metadata.definePlayer({ index: 0, firstName: 'Player', lastName: 'One' });
    match.metadata.definePlayer({ index: 1, firstName: 'Player', lastName: 'Two' });

    // Play one game: Player 0 wins 4-0
    for (let i = 0; i < 4; i++) {
      match.addPoint(0);
    }

    const sets = match.sets();
    const points = sets[0].history.action('addPoint');

    console.log('\n=== Points to Set Calculation ===');
    points.forEach((episode: any, i: number) => {
      const needed = episode.needed || episode.point.needed;
      console.log(`Point ${i}:`, {
        score: episode.point.score,
        games: `${sets[0].score().counters.local[0]}-${sets[0].score().counters.local[1]}`,
        points_to_set: needed?.points_to_set,
        games_to_set: needed?.games_to_set,
      });
      
      // Each point should have points_to_set defined
      expect(needed).toBeDefined();
      expect(needed.points_to_set).toBeDefined();
      expect(Array.isArray(needed.points_to_set)).toBe(true);
      expect(needed.points_to_set.length).toBe(2);
      
      // Both players should have a number for points_to_set
      expect(typeof needed.points_to_set[0]).toBe('number');
      expect(typeof needed.points_to_set[1]).toBe('number');
    });
  });

  test('should calculate correct points_to_set values at different game scores', () => {
    const umo = createV3Adapter();
    const match = umo.Match({ matchUpFormat: 'SET3-S:6/TB7' });
    
    match.metadata.definePlayer({ index: 0, firstName: 'Player', lastName: 'One' });
    match.metadata.definePlayer({ index: 1, firstName: 'Player', lastName: 'Two' });

    // Play to 5-4 (Player 0 leading)
    // Player 0 wins 5 games
    for (let game = 0; game < 5; game++) {
      for (let point = 0; point < 4; point++) {
        match.addPoint(0);
      }
    }
    
    // Player 1 wins 4 games
    for (let game = 0; game < 4; game++) {
      for (let point = 0; point < 4; point++) {
        match.addPoint(1);
      }
    }

    // Now at 5-4, add one more point
    match.addPoint(0); // 15-0 in the 10th game

    const sets = match.sets();
    const allPoints = sets[0].history.action('addPoint');
    const lastPoint = allPoints[allPoints.length - 1];
    const needed = lastPoint.needed || lastPoint.point.needed;

    console.log('\n=== 5-4, 15-0 Scenario ===');
    console.log('Last point needed:', {
      points_to_set: needed.points_to_set,
      games_to_set: needed.games_to_set,
    });

    // At 5-4, 15-0:
    // Player 0 needs 1 game to win set (so 3 more points in current game = 3 points)
    // Player 1 needs 2 games to win set (so current game + 1 more = 8 points minimum)
    expect(needed.points_to_set).toBeDefined();
    expect(needed.points_to_set[0]).toBeLessThan(needed.points_to_set[1]);
    
    // Player 0 should need fewer points (closer to winning)
    expect(needed.points_to_set[0]).toBeGreaterThan(0);
    expect(needed.points_to_set[1]).toBeGreaterThan(needed.points_to_set[0]);
  });

  test('should work with set history.action filter like ptsChart uses', () => {
    const umo = createV3Adapter();
    const match = umo.Match({ matchUpFormat: 'SET3-S:6/TB7' });
    
    match.metadata.definePlayer({ index: 0, firstName: 'Player', lastName: 'One' });
    match.metadata.definePlayer({ index: 1, firstName: 'Player', lastName: 'Two' });

    // Play pattern: 000011110000 (3 games)
    const pattern = '000011110000';
    for (let i = 0; i < pattern.length; i++) {
      const winner = parseInt(pattern[i]);
      match.addPoint(winner);
    }

    const sets = match.sets();
    const set_data = sets[0];
    
    // This is how ptsChart accesses the data:
    const points = set_data.history.action('addPoint').filter((f: any) => f.point.set === 0);
    const points_to_set = points.map((p: any) => p.needed.points_to_set);

    console.log('\n=== PtsChart Access Pattern ===');
    console.log('Total points:', points.length);
    console.log('Sample points_to_set values:', points_to_set.slice(0, 5));

    // Should have points_to_set for all points
    expect(points_to_set.length).toBe(points.length);
    
    // No undefined values
    points_to_set.forEach((pts: any, idx: number) => {
      expect(pts).toBeDefined();
      expect(Array.isArray(pts)).toBe(true);
      expect(pts.length).toBe(2);
    });

    // Values should be reasonable (not all zeros, not all the same)
    const uniqueValues = new Set(points_to_set.map((pts: any) => JSON.stringify(pts)));
    expect(uniqueValues.size).toBeGreaterThan(1); // Should vary as match progresses
  });
});
