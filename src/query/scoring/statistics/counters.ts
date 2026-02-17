/**
 * Statistics Counter Builder
 * 
 * Groups points by category for statistics calculation.
 * Builds the counters structure that matches v3 API format.
 */

import { PointWithMetadata, StatCounters, StatisticsOptions } from './types';
import { categorizePoint } from './pointParser';

/**
 * Build statistics counters from point history
 * 
 * Groups points into categories for each team/player:
 * - aces, doubleFaults
 * - winners, unforcedErrors, forcedErrors
 * - pointsWon, pointsServed
 * - servesWon, servesLost, returns
 * - serves1stIn, serves2ndIn, serves1stWon, serves2ndWon
 * - gamesWon
 * - breakpointsFaced, breakpointsSaved
 * 
 * @param points - Array of points with metadata
 * @param options - Statistics options (set filter, etc.)
 * @returns Counters grouped by team and category
 */
export function buildCounters(
  points: PointWithMetadata[],
  options?: StatisticsOptions
): StatCounters {
  const counters: StatCounters = {
    players: {},
    teams: {},
  };
  
  // Initialize structures
  for (let i = 0; i < 2; i++) {
    counters.players[i] = {};
    counters.teams[i] = {};
  }
  
  // Filter by set if specified
  let filteredPoints = points;
  if (options?.setFilter !== undefined) {
    filteredPoints = points.filter(p => p.set === options.setFilter);
  }
  
  // Process each point
  let lastPoint: PointWithMetadata | undefined;
  
  filteredPoints.forEach((point, index) => {
    // Skip points without winner (shouldn't happen with new logger)
    if (point.winner === undefined) {
      console.warn('Point missing winner:', point);
      return;
    }
    
    // Get categories for this point
    const categories = categorizePoint(point);
    const winner = point.winner;
    
    // DEBUG: Log first few points
    if (index < 3) {
      // console.log(`buildCounters Point ${index}:`, { 
      //   result: point.result, 
      //   winner: point.winner, 
      //   server: point.server,
      //   categories 
      // });
    }
    
    // Add to each category
    categories.forEach(category => {
      // Team counters
      if (!counters.teams[winner][category]) {
        counters.teams[winner][category] = [];
      }
      counters.teams[winner][category].push(point);
      
      // Player counters (for doubles support later)
      if (!counters.players[winner][category]) {
        counters.players[winner][category] = [];
      }
      counters.players[winner][category].push(point);
    });
    
    // Track serve stats for the SERVER (regardless of who won)
    if (point.server !== undefined) {
      const server = point.server;
      if (!counters.teams[server].pointsServed) {
        counters.teams[server].pointsServed = [];
      }
      counters.teams[server].pointsServed.push(point);

      if (point.serve === 1) {
        if (!counters.teams[server].serves1stIn) {
          counters.teams[server].serves1stIn = [];
        }
        counters.teams[server].serves1stIn.push(point);
      } else if (point.serve === 2) {
        if (!counters.teams[server].serves2ndIn) {
          counters.teams[server].serves2ndIn = [];
        }
        counters.teams[server].serves2ndIn.push(point);
      }
    }

    // Track stroke/hand breakdown (v3 compatibility)
    if (point.hand) {
      const handCategory = point.hand; // 'Forehand' or 'Backhand'
      // console.log(`[UMO-V4] Hand tracking: Point ${index} - winner: ${winner}, hand: ${handCategory}`);
      if (!counters.teams[winner][handCategory]) {
        counters.teams[winner][handCategory] = [];
      }
      counters.teams[winner][handCategory].push({ point, index });
      // console.log(`[UMO-V4] Added to counters.teams[${winner}].${handCategory}, length now:`, counters.teams[winner][handCategory].length);
    } else {
      if (index < 3) {
        // console.log(`[UMO-V4] Point ${index} has NO hand field:`, point);
      }
    }
    
    // Track game completions for gamesWon stat
    if (isGameComplete(point, lastPoint)) {
      // Add to gamesWon
      if (!counters.teams[winner].gamesWon) {
        counters.teams[winner].gamesWon = [];
      }
      counters.teams[winner].gamesWon.push(point);
      
      if (!counters.players[winner].gamesWon) {
        counters.players[winner].gamesWon = [];
      }
      counters.players[winner].gamesWon.push(point);
    }
    
    // Track breakpoints
    if (point.breakpoint) {
      const server = point.server!;
      
      // Server faced a breakpoint
      if (!counters.teams[server].breakpointsFaced) {
        counters.teams[server].breakpointsFaced = [];
      }
      counters.teams[server].breakpointsFaced.push(point);
      
      // If server won, they saved it
      if (winner === server) {
        if (!counters.teams[server].breakpointsSaved) {
          counters.teams[server].breakpointsSaved = [];
        }
        counters.teams[server].breakpointsSaved.push(point);
      }
    }
    
    lastPoint = point;
  });
  
  return counters;
}

/**
 * Check if a game was completed with this point
 * 
 * Heuristic: Game number increased from last point to current point
 * 
 * @param currentPoint - Current point
 * @param lastPoint - Previous point
 * @returns True if game was completed
 */
function isGameComplete(
  currentPoint: PointWithMetadata,
  lastPoint: PointWithMetadata | undefined
): boolean {
  if (!lastPoint) return false;
  
  // If we have explicit game numbers, check if they changed
  if (currentPoint.game !== undefined && lastPoint.game !== undefined) {
    return currentPoint.game !== lastPoint.game;
  }
  
  // Otherwise, can't determine
  return false;
}

/**
 * Get summary statistics from counters
 * 
 * @param counters - Statistics counters
 * @returns Summary with totals and breakdowns
 */
export function getCountersSummary(counters: StatCounters): {
  totalPoints: number;
  byTeam: number[];
  byCategory: Record<string, number>;
} {
  const summary = {
    totalPoints: 0,
    byTeam: [0, 0] as number[],
    byCategory: {} as Record<string, number>,
  };
  
  // Count points per team
  for (let team = 0; team < 2; team++) {
    if (counters.teams[team].pointsWon) {
      const count = counters.teams[team].pointsWon.length;
      summary.byTeam[team] = count;
      summary.totalPoints += count;
    }
  }
  
  // Count by category (aggregate both teams)
  const allCategories = new Set<string>();
  for (let team = 0; team < 2; team++) {
    Object.keys(counters.teams[team]).forEach(cat => allCategories.add(cat));
  }
  
  allCategories.forEach(category => {
    summary.byCategory[category] = 0;
    for (let team = 0; team < 2; team++) {
      if (counters.teams[team][category]) {
        summary.byCategory[category] += counters.teams[team][category].length;
      }
    }
  });
  
  return summary;
}

/**
 * Filter counters to specific set
 * 
 * @param counters - Full match counters
 * @param setNumber - Set to filter to (0-based)
 * @returns Counters filtered to set
 */
export function filterCountersBySet(
  counters: StatCounters,
  setNumber: number
): StatCounters {
  const filtered: StatCounters = {
    players: {},
    teams: {},
  };
  
  for (let i = 0; i < 2; i++) {
    filtered.players[i] = {};
    filtered.teams[i] = {};
  }
  
  // Filter each category
  for (let team = 0; team < 2; team++) {
    Object.keys(counters.teams[team]).forEach(category => {
      const points = counters.teams[team][category];
      const setPoints = points.filter(p => p.set === setNumber);
      
      if (setPoints.length > 0) {
        filtered.teams[team][category] = setPoints;
        filtered.players[team][category] = setPoints; // Same for now
      }
    });
  }
  
  return filtered;
}
