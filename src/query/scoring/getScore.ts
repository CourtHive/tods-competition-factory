/**
 * getScore - Get current score from matchUp
 * 
 * Pure function that extracts score information
 */

import type { MatchUp, ScoreResult } from '@Types/scoring/types';

export interface GetScoreOptions {
  useBracketNotation?: boolean; // Use [10-8] format for match tiebreaks
}

/**
 * Get the current score
 * 
 * @param matchUp - Current matchUp state
 * @param options - Score formatting options
 * @returns Score information
 */
export function getScore(matchUp: MatchUp, options?: GetScoreOptions): ScoreResult {
  const sets = matchUp.score.sets;
  
  // Build score string
  const scoreString = buildScoreString(matchUp, options?.useBracketNotation);
  
  // Get current games (last incomplete set or match score)
  const currentSet = sets.length > 0 ? sets[sets.length - 1] : null;
  const games = currentSet 
    ? [currentSet.side1Score || 0, currentSet.side2Score || 0]
    : [0, 0];
  
  // Get current points (last game in current set)
  let points: number[] = [0, 0];
  if (currentSet && currentSet.side1GameScores && currentSet.side2GameScores) {
    const gameIndex = Math.max(
      currentSet.side1GameScores.length,
      currentSet.side2GameScores.length
    ) - 1;
    
    if (gameIndex >= 0) {
      points = [
        currentSet.side1GameScores[gameIndex] || 0,
        currentSet.side2GameScores[gameIndex] || 0,
      ];
    }
  }
  
  return {
    sets,
    scoreString,
    games,
    points,
  };
}

/**
 * Build score string (e.g., "6-4, 4-6, 6-3")
 * 
 * @param matchUp - The matchUp to get score from
 * @param useBracketNotation - Use [10-8] format for match tiebreaks (default: false)
 */
function buildScoreString(matchUp: MatchUp, useBracketNotation: boolean = false): string {
  const sets = matchUp.score.sets;
  
  if (sets.length === 0) {
    return '0-0';
  }
  
  const setStrings = sets.map(set => {
    const s1 = set.side1Score || 0;
    const s2 = set.side2Score || 0;
    
    // Check if tiebreak was played
    if (set.side1TiebreakScore !== undefined || set.side2TiebreakScore !== undefined) {
      const tb1 = set.side1TiebreakScore || 0;
      const tb2 = set.side2TiebreakScore || 0;
      
      // Check if this is a match tiebreak (setTo = tiebreak max score)
      const isMatchTiebreak = (s1 === 0 && s2 === 1) || (s1 === 1 && s2 === 0);
      
      if (useBracketNotation && isMatchTiebreak) {
        // Use [10-8] notation for match tiebreaks
        return `[${tb1}-${tb2}]`;
      }
      
      // Show tiebreak score in parentheses for loser
      if (s1 > s2) {
        return `${s1}-${s2}(${tb2})`;
      } else {
        return `${s1}(${tb1})-${s2}`;
      }
    }
    
    return `${s1}-${s2}`;
  });
  
  return setStrings.join(', ');
}
