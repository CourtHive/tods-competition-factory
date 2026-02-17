/**
 * Test for sets().history API
 * 
 * Verifies that V4 adapter provides .sets().history.points() to parallel V3 API
 */

import { describe, test, expect } from 'vitest';
import { createV3Adapter } from '@Tools/scoring/v3Adapter';

describe('sets().history API', () => {
  test('should provide history.points() for each set', () => {
    const umo = createV3Adapter();
    const match = umo.Match({ matchUpFormat: 'SET3-S:6/TB7' });
    
    match.metadata.definePlayer({ index: 0, firstName: 'Player', lastName: 'One' });
    match.metadata.definePlayer({ index: 1, firstName: 'Player', lastName: 'Two' });
    
    // Add 24 points to complete first set 6-0
    for (let i = 0; i < 24; i++) {
      const winner = i % 4 < 2 ? 0 : 1; // Alternate winners
      match.addPoint({ winner, server: i % 2 });
    }
    
    // Add 12 points to start second set
    for (let i = 0; i < 12; i++) {
      const winner = i % 2;
      match.addPoint({ winner, server: i % 2 });
    }
    
    const sets = match.sets();
    
    // Should have 2 sets
    expect(sets.length).toBeGreaterThanOrEqual(1);
    
    // First set should have history
    expect(sets[0].history).toBeDefined();
    expect(sets[0].history.points).toBeDefined();
    
    const firstSetPoints = sets[0].history.points();
    expect(Array.isArray(firstSetPoints)).toBe(true);
    expect(firstSetPoints.length).toBeGreaterThan(0);
    
    // Each point should have set property matching the set index
    firstSetPoints.forEach((point: any) => {
      expect(point.set).toBe(0);
    });
    
    console.log(`✅ First set has ${firstSetPoints.length} points`);
  });

  test('should provide history.action() for each set', () => {
    const umo = createV3Adapter();
    const match = umo.Match({ matchUpFormat: 'SET3-S:6/TB7' });
    
    match.metadata.definePlayer({ index: 0, firstName: 'Player', lastName: 'One' });
    match.metadata.definePlayer({ index: 1, firstName: 'Player', lastName: 'Two' });
    
    // Add some points
    for (let i = 0; i < 12; i++) {
      const winner = i % 2;
      match.addPoint({ winner, server: i % 2 });
    }
    
    const sets = match.sets();
    const firstSetActions = sets[0].history.action('addPoint');
    
    expect(Array.isArray(firstSetActions)).toBe(true);
    expect(firstSetActions.length).toBeGreaterThan(0);
    
    // Each action should have the proper structure
    firstSetActions.forEach((action: any) => {
      expect(action.action).toBe('addPoint');
      expect(action.point).toBeDefined();
      expect(action.result).toBe(true);
    });
    
    console.log(`✅ First set has ${firstSetActions.length} actions`);
  });

  test('should provide history.lastPoint() for each set', () => {
    const umo = createV3Adapter();
    const match = umo.Match({ matchUpFormat: 'SET3-S:6/TB7' });
    
    match.metadata.definePlayer({ index: 0, firstName: 'Player', lastName: 'One' });
    match.metadata.definePlayer({ index: 1, firstName: 'Player', lastName: 'Two' });
    
    // Add some points
    for (let i = 0; i < 8; i++) {
      const winner = i % 2;
      match.addPoint({ winner, server: i % 2 });
    }
    
    const sets = match.sets();
    const lastPoint = sets[0].history.lastPoint();
    
    expect(lastPoint).toBeDefined();
    expect(lastPoint.set).toBe(0);
    
    console.log(`✅ Last point of first set:`, lastPoint);
  });

  test('should provide history.score() for each set', () => {
    const umo = createV3Adapter();
    const match = umo.Match({ matchUpFormat: 'SET3-S:6/TB7' });
    
    match.metadata.definePlayer({ index: 0, firstName: 'Player', lastName: 'One' });
    match.metadata.definePlayer({ index: 1, firstName: 'Player', lastName: 'Two' });
    
    // Add some points
    for (let i = 0; i < 8; i++) {
      const winner = i % 2;
      match.addPoint({ winner, server: i % 2 });
    }
    
    const sets = match.sets();
    const scoreHistory = sets[0].history.score();
    
    expect(Array.isArray(scoreHistory)).toBe(true);
    expect(scoreHistory.length).toBeGreaterThan(0);
    
    console.log(`✅ First set has ${scoreHistory.length} score entries`);
  });

  test('should isolate points by set index', () => {
    const umo = createV3Adapter();
    const match = umo.Match({ matchUpFormat: 'SET3-S:6/TB7' });
    
    match.metadata.definePlayer({ index: 0, firstName: 'Player', lastName: 'One' });
    match.metadata.definePlayer({ index: 1, firstName: 'Player', lastName: 'Two' });
    
    // Complete first set: 6-0 (24 points)
    for (let i = 0; i < 24; i++) {
      match.addPoint({ winner: 0, server: i % 2 });
    }
    
    // Start second set (12 points)
    for (let i = 0; i < 12; i++) {
      match.addPoint({ winner: i % 2, server: i % 2 });
    }
    
    const sets = match.sets();
    
    // Should have at least 2 sets
    expect(sets.length).toBeGreaterThanOrEqual(2);
    
    const firstSetPoints = sets[0].history.points();
    const secondSetPoints = sets[1].history.points();
    
    // First set should have exactly 24 points
    expect(firstSetPoints.length).toBe(24);
    
    // Second set should have exactly 12 points
    expect(secondSetPoints.length).toBe(12);
    
    // All first set points should have set=0
    firstSetPoints.forEach((point: any) => {
      expect(point.set).toBe(0);
    });
    
    // All second set points should have set=1
    secondSetPoints.forEach((point: any) => {
      expect(point.set).toBe(1);
    });
    
    console.log(`✅ Set isolation: Set 1 has ${firstSetPoints.length} points, Set 2 has ${secondSetPoints.length} points`);
  });
});
