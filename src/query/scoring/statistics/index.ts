/**
 * UMO v4 Statistics Module
 * 
 * Provides statistics tracking and calculation compatible with v3 API.
 * Can be used standalone or integrated with ScoringEngine.
 * 
 * @example Standalone usage
 * ```typescript
 * import { calculateMatchStatistics } from '@tennisvisuals/universal-match-object/v4-stats';
 * 
 * const stats = calculateMatchStatistics(matchUp, points);
 * console.log(stats.calculated); // Array of all statistics
 * ```
 * 
 * @example With v3 adapter
 * ```typescript
 * import { Match } from '@tennisvisuals/universal-match-object/v4-umo';
 * 
 * const match = Match({ matchUpFormat: 'SET3-S:6/TB7' });
 * match.addPoint({ winner: 0, result: 'Ace' });
 * 
 * const stats = match.stats.calculated(); // v3 API
 * ```
 */

export * from './types';
export * from './pointParser';
export * from './counters';
export * from './calculator';
export * from './standalone';
