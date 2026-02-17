/**
 * UMO V4 Statistics Parity Test
 * 
 * Verifies that V4 statistics achieve full parity with V3:
 * - All counter categories work
 * - All calculated stats work
 * - Stroke breakdowns work
 * - Rally tracking works
 * - Serve/return location tracking works
 */

import { describe, it, expect } from 'vitest';
import { createV3Adapter } from '@Tools/scoring/v3Adapter';
import { buildCounters } from '@Query/scoring/statistics/counters';
import { calculateStats } from '@Query/scoring/statistics/calculator';
import type { PointWithMetadata } from '@Query/scoring/statistics/types';

const { Match } = createV3Adapter();

describe('V4 Statistics - Full Parity', () => {
  
  it('should track all basic statistics', () => {
    const match = Match({ matchUpFormat: 'SET3-S:6/TB7' });
    
    // Add diverse points
    match.addPoint({ winner: 0, result: 'Ace', serve: 1 });
    match.addPoint({ winner: 0, result: 'Winner', serve: 1 });
    match.addPoint({ winner: 1, result: 'Double Fault', serve: 0 });
    match.addPoint({ winner: 1, result: 'Unforced Error', serve: 0 });
    match.addPoint({ winner: 0, result: 'Forced Error', serve: 1 });
    match.addPoint({ winner: 1, result: 'Winner', serve: 0 });
    
    const stats = match.stats.calculated();
    const counters = match.stats.counters();
    
    // Verify basic counters
    expect(counters.teams[0].aces?.length).toBe(1);
    expect(counters.teams[0].doubleFaults).toBeUndefined(); // Player 0 didn't double fault
    expect(counters.teams[1].doubleFaults?.length).toBe(1);
    expect(counters.teams[0].winners?.length).toBe(2); // Ace counts as winner
    expect(counters.teams[1].unforcedErrors?.length).toBe(1);
    expect(counters.teams[0].forcedErrors?.length).toBe(1);
    
    // Verify calculated stats exist
    const acesStat = stats.find(s => s.category === 'Aces');
    expect(acesStat).toBeDefined();
    expect(acesStat?.teams[0].value).toBe(1);
    
    const dfStat = stats.find(s => s.category === 'Double Faults');
    expect(dfStat).toBeDefined();
    expect(dfStat?.teams[1].value).toBe(1);
    
    const winnersStat = stats.find(s => s.category === 'Winners');
    expect(winnersStat).toBeDefined();
    
    const ufesStat = stats.find(s => s.category === 'Unforced Errors');
    expect(ufesStat).toBeDefined();
  });
  
  it('should track serve statistics', () => {
    // Test serve attribution directly with constructed point data
    const points: PointWithMetadata[] = [
      // Game 1: Player 0 serves (4 points, holds)
      { winner: 0, server: 0, serve: 1, set: 0, game: 0, index: 0 },
      { winner: 0, server: 0, serve: 1, set: 0, game: 0, index: 1 },
      { winner: 0, server: 0, serve: 2, set: 0, game: 0, index: 2 }, // 2nd serve, won
      { winner: 0, server: 0, serve: 1, set: 0, game: 0, index: 3 },
      // Game 2: Player 1 serves (5 points, holds 4-1)
      { winner: 1, server: 1, serve: 1, set: 0, game: 1, index: 4 },
      { winner: 0, server: 1, serve: 1, set: 0, game: 1, index: 5 }, // return winner
      { winner: 1, server: 1, serve: 2, set: 0, game: 1, index: 6 }, // 2nd serve, won
      { winner: 1, server: 1, serve: 1, set: 0, game: 1, index: 7 },
      { winner: 1, server: 1, serve: 1, set: 0, game: 1, index: 8 },
    ];

    const counters = buildCounters(points);
    const stats = calculateStats(counters);

    // Verify serve counters attributed to correct server
    expect(counters.teams[0].pointsServed?.length).toBe(4);
    expect(counters.teams[0].serves1stIn?.length).toBe(3);
    expect(counters.teams[0].serves2ndIn?.length).toBe(1);
    expect(counters.teams[1].pointsServed?.length).toBe(5);
    expect(counters.teams[1].serves1stIn?.length).toBe(4);
    expect(counters.teams[1].serves2ndIn?.length).toBe(1);

    // Verify serve stats calculated
    const firstServeStat = stats.find(s => s.category === 'First Serve %');
    expect(firstServeStat).toBeDefined();
    expect(firstServeStat!.teams[0].value).toBe(75); // 3/4
    expect(firstServeStat!.teams[1].value).toBe(80); // 4/5

    const pts1stStat = stats.find(s => s.category === 'Points Won 1st');
    expect(pts1stStat).toBeDefined();

    const pts2ndStat = stats.find(s => s.category === 'Points Won 2nd');
    expect(pts2ndStat).toBeDefined();

    const receivingStat = stats.find(s => s.category === 'Points Won Receiving');
    expect(receivingStat).toBeDefined();
  });
  
  it('should track breakpoint statistics', () => {
    const match = Match({ matchUpFormat: 'SET3-S:6/TB7' });
    
    // Create a breakpoint situation
    // Player 0 serves, down 0-40
    match.addPoint({ winner: 1 }); // 0-15
    match.addPoint({ winner: 1 }); // 0-30
    match.addPoint({ winner: 1 }); // 0-40 - breakpoint!
    match.addPoint({ winner: 0 }); // 15-40 - saved!
    match.addPoint({ winner: 0 }); // 30-40 - saved again!
    match.addPoint({ winner: 1 }); // Break converted
    
    const counters = match.stats.counters();
    const stats = match.stats.calculated();
    
    console.log('\nBreakpoint stats:');
    stats.filter(s => s.category.includes('Breakpoint')).forEach(s => {
      console.log(`  ${s.category}: ${s.teams[0].display} - ${s.teams[1].display}`);
    });
    
    // Verify breakpoint tracking
    expect(counters.teams[0].breakpointsFaced).toBeDefined();
    expect(counters.teams[0].breakpointsFaced.length).toBeGreaterThan(0);
    expect(counters.teams[0].breakpointsSaved).toBeDefined();
    
    const bpSavedStat = stats.find(s => s.category === 'Breakpoints Saved');
    expect(bpSavedStat).toBeDefined();
    
    const bpConvertedStat = stats.find(s => s.category === 'Breakpoints Converted');
    expect(bpConvertedStat).toBeDefined();
  });
  
  it('should track stroke breakdown (Forehand/Backhand)', () => {
    const match = Match({ matchUpFormat: 'SET3-S:6/TB7' });
    
    // Add points with stroke metadata
    match.addPoint({ winner: 0, hand: 'Forehand', stroke: 'Drive', result: 'Winner' });
    match.addPoint({ winner: 0, hand: 'Forehand', stroke: 'Volley', result: 'Winner' });
    match.addPoint({ winner: 1, hand: 'Backhand', stroke: 'Drive', result: 'Winner' });
    match.addPoint({ winner: 0, hand: 'Backhand', stroke: 'Slice', result: 'Winner' });
    match.addPoint({ winner: 1, hand: 'Forehand', stroke: 'Drive', result: 'Unforced Error' });
    
    const counters = match.stats.counters();
    
    console.log('\nStroke breakdown:');
    console.log('  Player 0 Forehand:', counters.teams[0].Forehand?.length || 0);
    console.log('  Player 0 Backhand:', counters.teams[0].Backhand?.length || 0);
    console.log('  Player 1 Forehand:', counters.teams[1].Forehand?.length || 0);
    console.log('  Player 1 Backhand:', counters.teams[1].Backhand?.length || 0);
    
    // Verify stroke counters
    expect(counters.teams[0].Forehand).toBeDefined();
    expect(counters.teams[0].Forehand.length).toBe(2);
    expect(counters.teams[0].Backhand).toBeDefined();
    expect(counters.teams[0].Backhand.length).toBe(1);
    expect(counters.teams[1].Backhand).toBeDefined();
    expect(counters.teams[1].Backhand.length).toBe(1);
    
    // Verify we can filter by stroke and result
    const p0ForehandWinners = counters.teams[0].Forehand.filter(
      p => p.point.result?.includes('Winner')
    );
    expect(p0ForehandWinners.length).toBe(2);
  });
  
  it('should track rally length', () => {
    const match = Match({ matchUpFormat: 'SET3-S:6/TB7' });

    // Add points with rally metadata
    match.addPoint({ winner: 0, rally: 3 });
    match.addPoint({ winner: 1, rally: 8 });
    match.addPoint({ winner: 0, rally: 1 }); // Ace
    match.addPoint({ winner: 1, rally: 15 }); // Long rally

    const counters = match.stats.counters();

    // counters.teams[X].pointsWon contains raw PointWithMetadata objects
    const points = counters.teams[0].pointsWon.concat(counters.teams[1].pointsWon);
    const rallies = points.map(p => p.rally).filter(r => r !== undefined);

    // Verify rally data is preserved
    expect(counters.teams[0].pointsWon[0].rally).toBe(3);
    expect(counters.teams[1].pointsWon[0].rally).toBe(8);

    // Can calculate custom rally stats
    const longRallies = points.filter(p => p.rally && p.rally > 10);
    expect(longRallies.length).toBe(1);
  });
  
  it('should track serve and return locations', () => {
    const match = Match({ matchUpFormat: 'SET3-S:6/TB7' });

    // Add points with location metadata
    match.addPoint({ winner: 0, location: 'Wide' });
    match.addPoint({ winner: 0, location: 'T' });
    match.addPoint({ winner: 1, location: 'Body' });
    match.addPoint({ winner: 0, location: 'Wide' });

    const counters = match.stats.counters();

    // counters.teams[X].pointsWon contains raw PointWithMetadata objects
    const points = counters.teams[0].pointsWon.concat(counters.teams[1].pointsWon);

    // Verify location data is preserved
    expect(counters.teams[0].pointsWon[0].location).toBe('Wide');
    expect(counters.teams[0].pointsWon[1].location).toBe('T');

    // Can calculate location stats
    const wideServes = points.filter(p => p.location === 'Wide');
    expect(wideServes.length).toBe(2);

    const tServes = points.filter(p => p.location === 'T');
    expect(tServes.length).toBe(1);
  });
  
  it('should support set filtering', () => {
    const points: PointWithMetadata[] = [
      // Set 0: 4 points (2 each)
      { winner: 0, server: 0, serve: 1, set: 0, game: 0, index: 0, result: 'Ace' },
      { winner: 0, server: 0, serve: 1, set: 0, game: 0, index: 1, result: 'Winner' },
      { winner: 1, server: 0, serve: 1, set: 0, game: 0, index: 2, result: 'Winner' },
      { winner: 1, server: 0, serve: 2, set: 0, game: 0, index: 3, result: 'Winner' },
      // Set 1: 4 more points
      { winner: 0, server: 1, serve: 1, set: 1, game: 6, index: 4, result: 'Winner' },
      { winner: 0, server: 1, serve: 1, set: 1, game: 6, index: 5, result: 'Ace' },
      { winner: 1, server: 1, serve: 1, set: 1, game: 6, index: 6, result: 'Winner' },
      { winner: 1, server: 1, serve: 2, set: 1, game: 6, index: 7, result: 'Winner' },
    ];

    const allCounters = buildCounters(points);
    const set0Counters = buildCounters(points, { setFilter: 0 });
    const allStats = calculateStats(allCounters);
    const set0Stats = calculateStats(set0Counters);

    const allPts = allStats.find(s => s.category === 'Total Points Won');
    const set0Pts = set0Stats.find(s => s.category === 'Total Points Won');

    expect(allPts).toBeDefined();
    expect(set0Pts).toBeDefined();
    expect(allPts!.teams[0].value + allPts!.teams[1].value).toBe(8);
    expect(set0Pts!.teams[0].value + set0Pts!.teams[1].value).toBe(4);
    expect(set0Pts!.teams[0].value + set0Pts!.teams[1].value).toBeLessThan(
      allPts!.teams[0].value + allPts!.teams[1].value
    );
  });
  
  it('should calculate all V3-compatible statistics', () => {
    const match = Match({ matchUpFormat: 'SET3-S:6/TB7' });
    
    // Add varied points for comprehensive stats
    for (let i = 0; i < 50; i++) {
      const winner = i % 2;
      const serve = Math.floor(i / 4) % 2 === 0 ? 1 : 2;
      const results = ['Ace', 'Winner', 'Unforced Error', 'Forced Error', 'Double Fault'];
      const result = results[i % results.length];
      
      match.addPoint({ winner, serve, result });
    }
    
    const stats = match.stats.calculated();
    
    console.log('\n=== All V3-Compatible Statistics ===');
    stats.forEach(s => {
      console.log(`${s.category}: ${s.teams[0].display} - ${s.teams[1].display}`);
    });
    
    // Verify all expected stat categories exist
    const expectedStats = [
      'Aces',
      'Double Faults',
      'Winners',
      'Unforced Errors',
      'Forced Errors',
      'Total Points Won',
      'First Serve %',
      'Points Won 1st',
      'Points Won 2nd',
      'Points Won Receiving',
      'Breakpoints Saved',
      'Breakpoints Converted',
    ];
    
    expectedStats.forEach(statName => {
      const stat = stats.find(s => s.category === statName);
      console.log(`\n✅ ${statName}: ${stat ? 'FOUND' : '❌ MISSING'}`);
      if (!stat && !statName.includes('Breakpoint')) {
        // Breakpoints might not exist if no breakpoints occurred
        expect(stat).toBeDefined();
      }
    });
    
    // Verify stat structure matches V3
    stats.forEach(stat => {
      expect(stat).toHaveProperty('category');
      expect(stat).toHaveProperty('teams');
      expect(stat.teams).toHaveLength(2);
      stat.teams.forEach(team => {
        expect(team).toHaveProperty('value');
        expect(team).toHaveProperty('display');
        expect(typeof team.value).toBe('number');
        expect(typeof team.display).toBe('string');
      });
    });
  });
});
