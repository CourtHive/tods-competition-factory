/**
 * Point Parser
 * 
 * Parses and enriches point data from various input formats.
 * Handles code-only points (e.g., { code: "A" }) and derives missing fields.
 */

import { PointWithMetadata } from './types';

/**
 * UMO point code mappings
 */
const CODE_TO_RESULT: Record<string, string> = {
  'A': 'Ace',
  'D': 'Double Fault',
  'S': 'Serve Winner',
  'R': 'Return Winner',
  'W': 'Winner',
  'E': 'Unforced Error',
  'F': 'Forced Error',
};

/**
 * Codes that indicate server wins the point
 */
const SERVER_WINS_CODES = ['A', 'S'];

/**
 * Codes that indicate receiver wins the point
 */
const RECEIVER_WINS_CODES = ['D', 'R', 'E', 'F'];

/**
 * Enrich a point with derived/missing fields
 * 
 * @param rawPoint - Raw point data from hive-eye
 * @param context - Match context for deriving missing fields
 * @returns Enriched point with all necessary fields
 */
export function enrichPoint(
  rawPoint: any,
  context: {
    server: 0 | 1;
    index: number;
    set: number;
    game: number;
  }
): PointWithMetadata {
  const point: PointWithMetadata = { ...rawPoint };
  
  // Add context fields
  point.server = context.server;
  point.index = context.index;
  point.set = context.set;
  point.game = context.game;
  
  // Handle code-only points (e.g., { code: "A" })
  if (point.code && !point.winner) {
    point.winner = deriveWinnerFromCode(point.code, context.server);
  }
  
  // Derive result from code if missing
  if (point.code && !point.result) {
    point.result = CODE_TO_RESULT[point.code] as any;
  }
  
  // Derive serve number from first_serve presence
  if (point.first_serve) {
    point.serve = 2; // 2nd serve (first serve faulted)
  } else if (!point.serve) {
    // If not specified and no first_serve info, assume 1st serve
    point.serve = 1;
  }
  
  return point;
}

/**
 * Derive winner from UMO point code
 * 
 * @param code - UMO point code (A, D, S, R, etc.)
 * @param server - Server index (0 or 1)
 * @returns Winner index (0 or 1)
 */
export function deriveWinnerFromCode(code: string, server: 0 | 1): 0 | 1 {
  if (SERVER_WINS_CODES.includes(code)) {
    return server;
  }
  if (RECEIVER_WINS_CODES.includes(code)) {
    return (1 - server) as 0 | 1;
  }
  
  // Default: use explicit winner or assume server wins
  return server;
}

/**
 * Parse v3-style point input to standardized format
 * 
 * Handles multiple input patterns:
 * 1. Number: addPoint(0) -> { winner: 0 }
 * 2. Object: addPoint({ winner: 0, result: "Ace" })
 * 3. Code string: addPoint("A") -> { code: "A" }
 * 4. Object with metadata: addPoint({ code: "S", rally: 5 })
 * 
 * @param input - Point input (number, string, or object)
 * @returns Standardized point object
 */
export function parsePointInput(input: number | string | any): any {
  // Numeric input: just winner
  if (typeof input === 'number') {
    return { winner: input };
  }
  
  // String input: treat as code
  if (typeof input === 'string') {
    return { code: input };
  }
  
  // Object input: use as-is
  if (typeof input === 'object') {
    return input;
  }
  
  throw new Error(`Invalid point input: ${input}`);
}

/**
 * Categorize point by result for statistics
 * 
 * @param point - Point with metadata
 * @returns Statistics categories this point belongs to
 */
export function categorizePoint(point: PointWithMetadata): string[] {
  const categories: string[] = [];
  
  const result = point.result?.toLowerCase() || '';
  
  // Basic categorization
  if (result.includes('ace')) {
    categories.push('aces');
  }
  if (result.includes('double fault')) {
    categories.push('doubleFaults');
  }
  if (result.includes('winner') || result.includes('ace')) {
    categories.push('winners');
  }
  if (result.includes('unforced error')) {
    categories.push('unforcedErrors');
  }
  if (result.includes('forced error')) {
    categories.push('forcedErrors');
  }
  
  // Serve/return categorization
  const serverWon = point.winner === point.server;
  if (serverWon) {
    categories.push('servesWon');
    if (point.serve === 1) {
      categories.push('serves1stWon');
    } else if (point.serve === 2) {
      categories.push('serves2ndWon');
    }
  } else {
    categories.push('servesLost');
    categories.push('returns'); // Receiver won = successful return
    if (point.serve === 1) {
      categories.push('received1stWon');
    } else if (point.serve === 2) {
      categories.push('received2ndWon');
    }
  }
  
  // All points
  categories.push('pointsWon');
  
  return categories;
}

/**
 * Check if point was on serve or return
 * 
 * @param point - Point with metadata
 * @returns 'serve' if server won, 'return' if receiver won
 */
export function getPointType(point: PointWithMetadata): 'serve' | 'return' {
  return point.winner === point.server ? 'serve' : 'return';
}
