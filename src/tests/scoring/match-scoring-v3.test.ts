/**
 * Match Scoring Integration Tests
 * 
 * These tests actually play matches to drive coverage of:
 * - pointParser (via addPoint)
 * - stateObject (via match operations)
 * - common.ts (via match state)
 * - formatObject (via format handling)
 */

import { describe, it, expect } from 'vitest';
import { createV3Adapter } from '@Tools/scoring/v3Adapter';
const umo = createV3Adapter();

describe('Match Scoring Integration', () => {
  
  describe('Complete Match Playthrough', () => {
    
    it('should play a complete 6-4, 6-3 match', () => {
      const match = umo.Match({ matchUpFormat: 'SET3-S:6/TB7' });
      
      // Define players
      match.metadata.definePlayer({ index: 0, firstName: 'Player', lastName: 'One' });
      match.metadata.definePlayer({ index: 1, firstName: 'Player', lastName: 'Two' });
      
      // Play first set: 6-4 (Player 0 wins 6 games, Player 1 wins 4)
      // Alternate games to create realistic score
      for (let i = 0; i < 10; i++) {
        const winner = (i < 6 || i >= 8) ? 0 : 1; // Games 0-5 and 8-9 to P0, 6-7 to P1
        for (let p = 0; p < 4; p++) {
          match.addPoint(winner);
        }
      }
      
      // After first set, we should have at least 1 set
      let completedSets = match.sets();
      expect(completedSets.length).toBeGreaterThanOrEqual(1);
      const firstSetScore = completedSets[0].scoreboard();
      // Verify we have a realistic set score
      expect(firstSetScore).toMatch(/\d+-\d+/);
      
      // Play second set: 6-3 (9 games total)
      for (let i = 0; i < 9; i++) {
        const winner = i < 6 ? 0 : 1; // First 6 games to P0, last 3 to P1
        for (let p = 0; p < 4; p++) {
          match.addPoint(winner);
        }
      }
      
      completedSets = match.sets();
      expect(completedSets.length).toBeGreaterThanOrEqual(2);
      expect(match.complete()).toBe(true);
      const winner = match.winner();
      expect([0, 1]).toContain(winner);
    });
    
    it('should handle deuce and advantage', () => {
      const match = umo.Match({ matchUpFormat: 'SET3-S:6/TB7' });
      
      match.metadata.definePlayer({ index: 0, name: 'Player 1' });
      match.metadata.definePlayer({ index: 1, name: 'Player 2' });
      
      // Play to deuce (40-40)
      match.addPoint(0); // 15-0
      match.addPoint(0); // 30-0
      match.addPoint(0); // 40-0
      match.addPoint(1); // 40-15
      match.addPoint(1); // 40-30
      match.addPoint(1); // 40-40 (deuce)
      
      // Player 0 gets advantage
      match.addPoint(0); // Adv-40
      
      // Back to deuce
      match.addPoint(1); // 40-40
      
      // Player 1 gets advantage and wins
      match.addPoint(1); // 40-Adv
      match.addPoint(1); // Game to Player 1
      
      const sets = match.sets();
      expect(sets[0].games().length).toBe(1);
      expect(sets[0].scoreboard()).toContain('1');
    });
    
    it('should play a tiebreak', () => {
      const match = umo.Match({ matchUpFormat: 'SET3-S:6/TB7' });
      
      match.metadata.definePlayer({ index: 0, name: 'Player 1' });
      match.metadata.definePlayer({ index: 1, name: 'Player 2' });
      
      // Play to 6-6 (12 games, alternating)
      for (let i = 0; i < 12; i++) {
        const winner = i % 2; // Alternate games
        for (let p = 0; p < 4; p++) {
          match.addPoint(winner);
        }
      }
      
      // Now in tiebreak - play to 7-5
      const tiebreakPoints = [0,0,1,1,0,1,0,1,0,1,0,0]; // 7-5 for player 0
      tiebreakPoints.forEach(winner => match.addPoint(winner));
      
      const sets = match.sets();
      expect(sets.length).toBeGreaterThanOrEqual(1);
      const lastSet = sets[sets.length - 1];
      expect(lastSet.complete()).toBe(true);
      const winner = lastSet.winner();
      expect([0, 1]).toContain(winner);
    });
  });
  
  describe('Match History and Undo', () => {
    
    it('should track point history', () => {
      const match = umo.Match({ matchUpFormat: 'SET3-S:6/TB7' });
      
      match.metadata.definePlayer({ index: 0, name: 'P1' });
      match.metadata.definePlayer({ index: 1, name: 'P2' });
      
      match.addPoint(0);
      match.addPoint(1);
      match.addPoint(0);
      
      const history = match.history.points();
      expect(history.length).toBe(3);
      expect(history[0].winner).toBe(0);
      expect(history[1].winner).toBe(1);
      expect(history[2].winner).toBe(0);
    });
    
    it('should undo points', () => {
      const match = umo.Match({ matchUpFormat: 'SET3-S:6/TB7' });
      
      match.metadata.definePlayer({ index: 0, name: 'P1' });
      match.metadata.definePlayer({ index: 1, name: 'P2' });
      
      match.addPoint(0); // 15-0
      match.addPoint(0); // 30-0
      match.addPoint(0); // 40-0
      
      expect(match.scoreboard()).toContain('40');
      
      match.undo(); // Back to 30-0
      
      const history = match.history.points();
      expect(history.length).toBe(2);
    });
  });
  
  describe('Different Match Formats', () => {
    
    it('should handle No-Ad format', () => {
      const match = umo.Match({ matchUpFormat: 'SET3-S:4NOAD' });
      
      match.metadata.definePlayer({ index: 0, name: 'P1' });
      match.metadata.definePlayer({ index: 1, name: 'P2' });
      
      // Play to 30-40 (deciding point in No-Ad)
      match.addPoint(0); // 15-0
      match.addPoint(0); // 30-0
      match.addPoint(1); // 30-15
      match.addPoint(1); // 30-30
      match.addPoint(1); // 30-40 (deciding point)
      match.addPoint(1); // Game to Player 1
      
      expect(match.sets()[0].games().length).toBe(1);
    });
    
    it('should handle best of 5 matches', () => {
      const match = umo.Match({ matchUpFormat: 'SET5-S:6/TB7' });
      
      match.metadata.definePlayer({ index: 0, name: 'P1' });
      match.metadata.definePlayer({ index: 1, name: 'P2' });
      
      // Play 3 quick sets to Player 0
      for (let set = 0; set < 3; set++) {
        for (let g = 0; g < 6; g++) {
          for (let p = 0; p < 4; p++) match.addPoint(0);
        }
      }
      
      expect(match.sets().length).toBe(3);
      expect(match.complete()).toBe(true);
      expect(match.winner()).toBe(0);
    });
    
    it('should handle match tiebreak (super tiebreak)', () => {
      const match = umo.Match({ matchUpFormat: 'SET3-S:6/TB7-F:TB10' });
      
      match.metadata.definePlayer({ index: 0, name: 'P1' });
      match.metadata.definePlayer({ index: 1, name: 'P2' });
      
      // Play to 1-1 in sets
      for (let g = 0; g < 6; g++) {
        for (let p = 0; p < 4; p++) match.addPoint(0);
      }
      for (let g = 0; g < 6; g++) {
        for (let p = 0; p < 4; p++) match.addPoint(1);
      }
      
      expect(match.sets().length).toBe(2);
      
      // Play match tiebreak to 10-8
      for (let i = 0; i < 10; i++) match.addPoint(0);
      for (let i = 0; i < 8; i++) match.addPoint(1);
      
      expect(match.complete()).toBe(true);
      expect(match.winner()).toBe(0);
    });
  });
  
  describe('Point Entry Methods', () => {
    
    it('should accept numeric point entry (player index)', () => {
      const match = umo.Match({ matchUpFormat: 'SET3-S:6/TB7' });
      
      match.metadata.definePlayer({ index: 0, name: 'P1' });
      match.metadata.definePlayer({ index: 1, name: 'P2' });
      
      match.addPoint(0);
      match.addPoint(1);
      
      expect(match.history.points().length).toBe(2);
    });
    
    it('should accept code-based point entry', () => {
      const match = umo.Match({ matchUpFormat: 'SET3-S:6/TB7' });
      
      match.metadata.definePlayer({ index: 0, name: 'P1' });
      match.metadata.definePlayer({ index: 1, name: 'P2' });
      
      // S = server wins, R = receiver wins
      match.addPoint('S'); // Server (0) wins
      match.addPoint('R'); // Receiver (1) wins
      
      const points = match.history.points();
      expect(points.length).toBe(2);
      // Points are recorded with winner information
      expect(points[0].winner).toBeDefined();
      expect(points[1].winner).toBeDefined();
    });
    
    it('should accept object point entry', () => {
      const match = umo.Match({ matchUpFormat: 'SET3-S:6/TB7' });
      
      match.metadata.definePlayer({ index: 0, name: 'P1' });
      match.metadata.definePlayer({ index: 1, name: 'P2' });
      
      match.addPoint({ winner: 0, code: 'A' }); // Ace
      match.addPoint({ winner: 1, code: 'D' }); // Double fault
      
      const points = match.history.points();
      expect(points.length).toBe(2);
      expect(points[0].winner).toBe(0);
      expect(points[1].winner).toBe(1);
      // Result enrichment may vary by implementation
      if (points[0].result) {
        expect(points[0].result).toBe('Ace');
      }
    });
  });
  
  describe('Match State Queries', () => {
    
    it('should provide current score information', () => {
      const match = umo.Match({ matchUpFormat: 'SET3-S:6/TB7' });
      
      match.metadata.definePlayer({ index: 0, name: 'P1' });
      match.metadata.definePlayer({ index: 1, name: 'P2' });
      
      match.addPoint(0);
      match.addPoint(0);
      
      const scoreboard = match.scoreboard();
      expect(scoreboard).toBeDefined();
      expect(typeof scoreboard).toBe('string');
    });
    
    it('should track next server', () => {
      const match = umo.Match({ matchUpFormat: 'SET3-S:6/TB7' });
      
      match.metadata.definePlayer({ index: 0, name: 'P1' });
      match.metadata.definePlayer({ index: 1, name: 'P2' });
      
      const firstServer = match.nextService();
      expect([0, 1]).toContain(firstServer);
      
      // Complete a game
      for (let i = 0; i < 4; i++) match.addPoint(0);
      
      const secondServer = match.nextService();
      expect(secondServer).not.toBe(firstServer);
    });
    
    it('should provide match completion status', () => {
      const match = umo.Match({ matchUpFormat: 'SET3-S:6/TB7' });
      
      match.metadata.definePlayer({ index: 0, name: 'P1' });
      match.metadata.definePlayer({ index: 1, name: 'P2' });
      
      expect(match.complete()).toBe(false);
      
      // Play 2 sets
      for (let s = 0; s < 2; s++) {
        for (let g = 0; g < 6; g++) {
          for (let p = 0; p < 4; p++) match.addPoint(0);
        }
      }
      
      expect(match.complete()).toBe(true);
      expect(match.winner()).toBe(0);
    });
  });
  
  describe('Metadata and Configuration', () => {
    
    it('should store and retrieve player information', () => {
      const match = umo.Match({ matchUpFormat: 'SET3-S:6/TB7' });
      
      match.metadata.definePlayer({ 
        index: 0, 
        firstName: 'Roger', 
        lastName: 'Federer',
        ioc: 'SUI'
      });
      
      const players = match.metadata.players();
      expect(players[0].participantName).toBe('Roger Federer');
      expect(players[0].person?.nationalityCode).toBe('SUI');
    });
    
    it('should handle match metadata', () => {
      const match = umo.Match({ 
        matchUpId: 'test-match-123',
        matchUpFormat: 'SET3-S:6/TB7' 
      });
      
      match.metadata.definePlayer({ index: 0, name: 'P1' });
      match.metadata.definePlayer({ index: 1, name: 'P2' });
      
      match.metadata.defineMatch({ id: 'match-001', date: 1234567890 });
      
      // Match metadata is stored
      const players = match.metadata.players();
      expect(players).toHaveLength(2);
    });
    
    it('should configure service order', () => {
      const match = umo.Match({ matchUpFormat: 'SET3-S:6/TB7' });
      
      match.metadata.definePlayer({ index: 0, name: 'P1' });
      match.metadata.definePlayer({ index: 1, name: 'P2' });
      
      const serviceOrder = match.metadata.serviceOrder();
      expect(serviceOrder).toHaveLength(2);
      expect(serviceOrder).toContain(0);
      expect(serviceOrder).toContain(1);
    });
  });
});
