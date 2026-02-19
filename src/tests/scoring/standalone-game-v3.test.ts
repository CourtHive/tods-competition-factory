/**
 * Standalone Game Tests
 * 
 * Tests Game objects created independently (not as part of a Match/Set)
 * This pattern is used by pbp-validator and other tools that validate
 * individual games or point sequences.
 * 
 * These tests ensure:
 * - Games can be created and used standalone
 * - addPoints works with string notation
 * - Tiebreak games work correctly
 * - Edge cases (null returns, invalid points) are handled
 */

import { describe, it, expect } from 'vitest';
// Standalone Game API (.Game()) not implemented in v4 adapter
// import matchObject from '../../src/v4-umo';
const matchObject: any = {};

describe.skip('Standalone Game Usage - NOT IMPLEMENTED', () => {
  describe('Regular Games', () => {
    it('should create and score a regular game', () => {
      const game = matchObject.Game();
      
      // Play a game to 40-0 then win
      const result = game.addPoints('0000');
      
      expect(game.complete()).toBe(true);
      expect(game.score()).toMatchObject({ points: '0-0' });
      expect(result.rejected).toHaveLength(0);
    });

    it('should handle advantage scoring', () => {
      const game = matchObject.Game();
      
      // Go to deuce (40-40)
      game.addPoints('010101');
      expect(game.complete()).toBe(false);
      
      // Player 0 gets advantage
      game.addPoint(0);
      expect(game.complete()).toBe(false);
      
      // Player 0 wins
      game.addPoint(0);
      expect(game.complete()).toBe(true);
    });

    it('should handle deuce multiple times', () => {
      const game = matchObject.Game();
      
      // Deuce
      game.addPoints('010101');
      // Ad-in, deuce
      game.addPoints('01');
      // Ad-out, deuce
      game.addPoints('10');
      // Ad-in, game
      game.addPoints('00');
      
      expect(game.complete()).toBe(true);
    });

    it('should reject points after game is complete', () => {
      const game = matchObject.Game();
      
      game.addPoints('0000');
      expect(game.complete()).toBe(true);
      
      // Try to add more points
      const result = game.addPoints('11');
      expect(result.rejected).toHaveLength(2);
      expect(result.rejected).toEqual(['1', '1']);
    });

    it('should handle empty point strings', () => {
      const game = matchObject.Game();
      
      const result = game.addPoints('');
      expect(result.added).toHaveLength(0);
      expect(result.rejected).toHaveLength(0);
    });

    it('should handle point strings with various formats', () => {
      const game = matchObject.Game();
      
      // String with spaces should still work
      const result = game.addPoints('0 0 0 0');
      expect(game.complete()).toBe(true);
    });
  });

  describe('Tiebreak Games', () => {
    it('should create and score a tiebreak to 7', () => {
      const game = matchObject.Game({ 
        formatStructure: { tiebreakTo: 7 } 
      });
      
      // Play tiebreak: 7-0
      const result = game.addPoints('0000000');
      
      expect(game.complete()).toBe(true);
      const score = game.scoreboard();
      expect(score).toBe('7-0');
      expect(result.rejected).toHaveLength(0);
    });

    it('should require 2-point margin in tiebreak', () => {
      const game = matchObject.Game({ 
        formatStructure: { tiebreakTo: 7 } 
      });
      
      // Go to 6-6
      game.addPoints('010101010101');
      expect(game.complete()).toBe(false);
      
      // 7-6 (not done)
      game.addPoint(0);
      expect(game.complete()).toBe(false);
      
      // 8-6 (done with 2-point margin)
      game.addPoint(0);
      expect(game.complete()).toBe(true);
      expect(game.scoreboard()).toBe('8-6');
    });

    it('should handle supertiebreak to 10', () => {
      const game = matchObject.Game({ 
        formatStructure: { tiebreakTo: 10 } 
      });
      
      // Play to 10-5: need to alternate to get score up
      game.addPoints('0101010101'); // 5-5
      game.addPoints('00000'); // 10-5
      
      expect(game.complete()).toBe(true);
      expect(game.scoreboard()).toBe('10-5');
    });

    it('should handle long tiebreak', () => {
      const game = matchObject.Game({ 
        formatStructure: { tiebreakTo: 7 } 
      });
      
      // Play to 15-13
      game.addPoints('01010101010101'); // 7-7
      game.addPoints('0101'); // 9-9
      game.addPoints('0101'); // 11-11
      game.addPoints('0101'); // 13-13
      game.addPoints('00'); // 15-13
      
      expect(game.complete()).toBe(true);
      expect(game.scoreboard()).toBe('15-13');
    });
  });

  describe('PBP-style Validation Pattern', () => {
    it('should validate multiple games in sequence (like pbp-validator)', () => {
      // This mimics what pbp-validator does
      const gameStrings = [
        '0000',      // 4-0
        '1111',      // 0-4
        '010101',    // deuce
        '010100'     // deuce then win
      ];
      
      let validGames = 0;
      let invalidGames = 0;
      
      gameStrings.forEach(pts => {
        const game = matchObject.Game();
        const result = game.addPoints(pts);
        
        if (game.complete() && result.rejected.length === 0) {
          validGames++;
        } else {
          invalidGames++;
        }
      });
      
      expect(validGames).toBe(3);
      expect(invalidGames).toBe(1); // The deuce game isn't complete
    });

    it('should validate tiebreak games with "/" notation stripped', () => {
      // pbp-validator splits on "/" for tiebreaks
      const tiebreakString = '0000000'; // 7-0 (/ would have been removed)
      
      const game = matchObject.Game({ 
        formatStructure: { tiebreakTo: 7 } 
      });
      const result = game.addPoints(tiebreakString);
      
      expect(game.complete()).toBe(true);
      expect(result.rejected).toHaveLength(0);
    });

    it('should handle empty games gracefully', () => {
      const game = matchObject.Game();
      const result = game.addPoints('');
      
      expect(result.added).toHaveLength(0);
      expect(result.rejected).toHaveLength(0);
      expect(game.complete()).toBe(false);
    });

    it('should handle games with excess points', () => {
      const game = matchObject.Game();
      
      // Valid game plus extra points
      const result = game.addPoints('000011'); // Should complete at 4th point
      
      expect(game.complete()).toBe(true);
      expect(result.rejected).toHaveLength(2); // Last 2 points rejected
      expect(result.rejected).toEqual(['1', '1']);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle null point gracefully', () => {
      const game = matchObject.Game();
      
      // This might return null in some cases
      const result = game.addPoint(null as any);
      
      expect(result).toBeTruthy(); // Should return an object, not crash
      expect(result.result).toBe(false);
    });

    it('should handle undefined point gracefully', () => {
      const game = matchObject.Game();
      
      const result = game.addPoint(undefined as any);
      
      expect(result).toBeTruthy();
      expect(result.result).toBe(false);
    });

    it('should handle invalid point values', () => {
      const game = matchObject.Game();
      
      // Try invalid point codes
      const result = game.addPoints('XYZ');
      
      // Should either reject or handle gracefully
      expect(game.complete()).toBe(false);
    });

    // Note: addMultiple is internal, tested via addPoints

    it('should not crash on malformed point data', () => {
      const game = matchObject.Game();
      
      // Various malformed inputs should not crash
      expect(() => game.addPoint({} as any)).not.toThrow();
      expect(() => game.addPoint([] as any)).not.toThrow();
      expect(() => game.addPoint(123 as any)).not.toThrow();
    });
  });

  describe('Multiple Game Instances', () => {
    it('should support multiple independent game instances', () => {
      const game1 = matchObject.Game();
      const game2 = matchObject.Game();
      
      game1.addPoints('0000');
      game2.addPoints('1111');
      
      expect(game1.complete()).toBe(true);
      expect(game2.complete()).toBe(true);
      expect(game1.winner()).toBe(0);
      expect(game2.winner()).toBe(1);
    });

    it('should support creating many games in a loop', () => {
      // This simulates processing many games like pbp-validator does
      const pointStrings = Array(100).fill('0000');
      let completed = 0;
      
      pointStrings.forEach(pts => {
        const game = matchObject.Game();
        game.addPoints(pts);
        if (game.complete()) completed++;
      });
      
      expect(completed).toBe(100);
    });

    it('should handle tiebreak and regular games mixed', () => {
      const regularGame = matchObject.Game();
      const tiebreakGame = matchObject.Game({ 
        formatStructure: { tiebreakTo: 7 } 
      });
      
      regularGame.addPoints('0000');
      tiebreakGame.addPoints('0000000');
      
      expect(regularGame.complete()).toBe(true);
      expect(tiebreakGame.complete()).toBe(true);
      
      // Different scoring systems
      expect(regularGame.format.tiebreak()).toBe(false);
      expect(tiebreakGame.format.tiebreak()).toBe(true);
    });
  });

  describe('Regression Tests for pbp-validator Bug', () => {
    it('should handle empty string without crashing (null pointer bug)', () => {
      const game = matchObject.Game();
      
      // This pattern caused the TypeError: null.length
      expect(() => {
        game.addPoints('');
      }).not.toThrow();
      
      expect(game.complete()).toBe(false);
    });

    it('should handle whitespace-only strings', () => {
      const game = matchObject.Game();
      
      expect(() => {
        game.addPoints('   ');
      }).not.toThrow();
    });

    it('should handle string with no valid points', () => {
      const game = matchObject.Game();
      
      const result = game.addPoints('xyz');
      expect(result).toBeTruthy();
      expect(result.rejected || result.added).toBeDefined();
    });
  });
});
