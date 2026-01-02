/**
 * Validate matchUp score against matchUpFormat
 */
import { parse } from '@Helpers/matchUpFormatCode/parse';

// constants
import { DEFAULTED, RETIRED, WALKOVER } from '@Constants/matchUpStatusConstants';

/**
 * Validate a single set score against matchUpFormat rules
 */
export function validateSetScore(
  set: any,
  matchUpFormat?: string,
  isDecidingSet?: boolean,
  allowIncomplete?: boolean,
): { isValid: boolean; error?: string } {
  if (!matchUpFormat) return { isValid: true }; // Can't validate without format

  const parsed = parse(matchUpFormat);
  if (!parsed) return { isValid: true }; // Can't validate if parse fails

  // Use finalSetFormat if it exists and this is the deciding set, otherwise use setFormat
  const setFormat = isDecidingSet && parsed.finalSetFormat ? parsed.finalSetFormat : parsed.setFormat;
  if (!setFormat) return { isValid: true };

  const { setTo, tiebreakAt, tiebreakFormat, tiebreakSet } = setFormat;

  // Check if this is a tiebreak-only format (SET1-S:TB10)
  // Tiebreak-only sets have tiebreakSet.tiebreakTo but no regular setTo
  const tiebreakSetTo = tiebreakSet?.tiebreakTo;
  const isTiebreakOnlyFormat = !!tiebreakSetTo && !setTo;
  const side1Score = set.side1Score || 0;
  const side2Score = set.side2Score || 0;
  const side1TiebreakScore = set.side1TiebreakScore;
  const side2TiebreakScore = set.side2TiebreakScore;

  const winnerScore = Math.max(side1Score, side2Score);
  const loserScore = Math.min(side1Score, side2Score);
  const scoreDiff = winnerScore - loserScore;

  // ===========================
  // TIEBREAK-ONLY SET VALIDATION (TB10, TB7, etc.)
  // ===========================
  if (isTiebreakOnlyFormat) {
    // For tiebreak-only sets, the entire set is a tiebreak (no games, just points)
    // Examples: SET1-S:TB10 means first to 10 points, win by 2
    // Valid scores: [10-12], [11-13], [33-35]
    // Invalid scores: [3-6], [35-3], [11-9], [10-10]
    // Allow incomplete if irregular ending
    if (allowIncomplete) {
      return { isValid: true };
    }
    // Both scores must be present
    if (side1Score === 0 && side2Score === 0) {
      return { isValid: false, error: 'Tiebreak-only set requires both scores' };
    }
    // Winner must reach at least tiebreakSetTo
    if (winnerScore < tiebreakSetTo) {
      return {
        isValid: false,
        error: `Tiebreak-only set winner must reach at least ${tiebreakSetTo}, got ${winnerScore}`,
      };
    }
    // Loser must be at least tiebreakSetTo - 1
    // This prevents scores like 35-3 (should be 35-33)
    // Check this BEFORE scoreDiff to give more specific error message
    if (loserScore < tiebreakSetTo - 1) {
      return {
        isValid: false,
        error: `Tiebreak-only set loser must be at least ${tiebreakSetTo - 1} when winner exceeds ${tiebreakSetTo}, got ${loserScore}`,
      };
    }
    // Must win by exactly 2 points
    if (scoreDiff !== 2) {
      return {
        isValid: false,
        error: `Tiebreak-only set must be won by exactly 2 points, got ${winnerScore}-${loserScore}`,
      };
    }
    // Valid tiebreak-only set
    return { isValid: true };
  }

  // Check for tiebreak set
  // Either explicit tiebreak scores, OR score pattern indicates tiebreak was played
  const hasExplicitTiebreak = side1TiebreakScore !== undefined || side2TiebreakScore !== undefined;
  const isImplicitTiebreak = setTo && winnerScore === setTo + 1 && loserScore === setTo;

  // Lenient tiebreak detection: if score is (tiebreakAt-1)-(tiebreakAt-2),
  // assume it might be a tiebreak set with missing tiebreak scores
  // Example: 7-6 in SET1-S:8/TB7 (loserScore=6, tiebreakAt-2=6, winnerScore=7, tiebreakAt-1=7)
  // This provides lenient validation for pro sets where tiebreak scores weren't recorded
  const isLikelyTiebreak = tiebreakAt && winnerScore === tiebreakAt - 1 && loserScore === tiebreakAt - 2;

  const hasTiebreak = hasExplicitTiebreak || isImplicitTiebreak || isLikelyTiebreak;

  if (hasTiebreak) {
    // Tiebreak set validation
    // Winner should have setTo+1 games, loser should have setTo games (e.g., 7-6 not 6-6)
    // UNLESS it's a "likely tiebreak" (lenient detection), in which case skip strict validation
    if (setTo && !isLikelyTiebreak) {
      if (winnerScore !== setTo + 1) {
        return {
          isValid: false,
          error: `Tiebreak set winner must have ${setTo + 1} games, got ${winnerScore}`,
        };
      }
      if (loserScore !== setTo) {
        return {
          isValid: false,
          error: `Tiebreak set loser must have ${setTo} games when tied, got ${loserScore}`,
        };
      }
    }

    // Validate explicit tiebreak score if present and format specified
    if (hasExplicitTiebreak && tiebreakFormat) {
      const tbWinnerScore = Math.max(side1TiebreakScore || 0, side2TiebreakScore || 0);
      const tbLoserScore = Math.min(side1TiebreakScore || 0, side2TiebreakScore || 0);
      const tbDiff = tbWinnerScore - tbLoserScore;
      const tbTo = tiebreakFormat.tiebreakTo || 7;

      // Winner must reach tbTo with 2-point margin, or go past tbTo with 2-point margin
      if (tbWinnerScore < tbTo) {
        return {
          isValid: false,
          error: `Tiebreak winner must reach ${tbTo} points, got ${tbWinnerScore}`,
        };
      }
      if (tbDiff < 2) {
        return {
          isValid: false,
          error: `Tiebreak must be won by 2 points, got ${tbWinnerScore}-${tbLoserScore}`,
        };
      }
      // If loser is at tbTo-1 or higher, winner must be exactly 2 ahead
      if (tbLoserScore >= tbTo - 1 && tbDiff > 2) {
        return {
          isValid: false,
          error: `Tiebreak score ${tbWinnerScore}-${tbLoserScore} is invalid`,
        };
      }
    }
  } else {
    // Regular set validation (no tiebreak)

    // CRITICAL VALIDATION: If there's a tiebreak format AND either side is setTo+1,
    // the other must be >= setTo-1 (2-game margin required)
    // This prevents invalid scores like 3-7, 4-7, etc. but allows 5-7, 6-7
    // For advantage sets (no tiebreak), scores like 7-5, 8-6 are valid
    if (setTo && tiebreakAt) {
      // Only enforce this rule when tiebreak format exists
      if (side1Score === setTo + 1 && side2Score < setTo - 1) {
        return {
          isValid: false,
          error: `With tiebreak format, if side 1 has ${setTo + 1} games, side 2 must be at least ${setTo - 1}, got ${side2Score}`,
        };
      }
      if (side2Score === setTo + 1 && side1Score < setTo - 1) {
        return {
          isValid: false,
          error: `With tiebreak format, if side 2 has ${setTo + 1} games, side 1 must be at least ${setTo - 1}, got ${side1Score}`,
        };
      }
    }

    // For incomplete scores (irregular endings), we're more lenient
    if (allowIncomplete) {
      // Basic validation: scores can't exceed reasonable limits
      if (setTo && (winnerScore > setTo + 10 || loserScore > setTo + 10)) {
        return {
          isValid: false,
          error: `Set score ${winnerScore}-${loserScore} exceeds expected range for ${setTo}-game sets`,
        };
      }
      // Allow any incomplete score (including 6-6 for RET/WO/DEF)
      return { isValid: true };
    }

    // Full validation for completed matches
    // Winner must reach setTo
    if (setTo && winnerScore < setTo) {
      return {
        isValid: false,
        error: `Set winner must reach ${setTo} games, got ${winnerScore}`,
      };
    }

    // Must have 2-game margin
    if (scoreDiff < 2) {
      return {
        isValid: false,
        error: `Set must be won by at least 2 games, got ${winnerScore}-${loserScore}`,
      };
    }

    // Check maximum score based on tiebreak rules
    if (tiebreakAt) {
      // Tiebreak format: once loser reaches tiebreakAt, must go to tiebreak
      if (loserScore >= tiebreakAt) {
        return {
          isValid: false,
          error: `When tied at ${tiebreakAt}-${tiebreakAt}, must play tiebreak. Use format like ${tiebreakAt + 1}-${tiebreakAt}(5)`,
        };
      }
      // Winner can be at most setTo+1 when tiebreak is available
      if (winnerScore > setTo + 1) {
        return {
          isValid: false,
          error: `With tiebreak format, set score cannot exceed ${setTo + 1}-${setTo - 1}. Got ${winnerScore}-${loserScore}`,
        };
      }
    } else {
      // No tiebreak (NOAD or advantage set): can go beyond setTo+1 with 2-game margin
      // But check reasonable upper limit (no set should go beyond setTo+10)
      if (winnerScore > setTo + 10) {
        return {
          isValid: false,
          error: `Set score ${winnerScore}-${loserScore} exceeds reasonable limits`,
        };
      }
    }
  }

  return { isValid: true };
}

/**
 * Validate all sets in a score against matchUpFormat
 */
export function validateMatchUpScore(
  sets: any[],
  matchUpFormat?: string,
  matchUpStatus?: string,
): { isValid: boolean; error?: string } {
  if (!sets || sets.length === 0) {
    return { isValid: true }; // Empty is valid (not an error, just incomplete)
  }

  // Parse matchUpFormat once
  const bestOfMatch = matchUpFormat?.match(/SET(\d+)/)?.[1];
  const bestOfSets = bestOfMatch ? Number.parseInt(bestOfMatch) : 3;

  // Check if this appears to be an incomplete match:
  // - At least one set is missing winningSide (in-progress)
  const hasIncompleteSet = sets.some((set) => !set.winningSide);

  // Allow incomplete scores if:
  // 1. Irregular ending (RETIRED, WALKOVER, DEFAULTED)
  // 2. No matchUpStatus AND at least one set is missing winningSide (in-progress)
  const isIrregularEnding = [RETIRED, WALKOVER, DEFAULTED].includes(matchUpStatus || '');
  const allowIncomplete = isIrregularEnding || (!matchUpStatus && hasIncompleteSet);

  // Validate each set against matchUpFormat
  for (let i = 0; i < sets.length; i++) {
    // Check if this is the deciding set (the last possible set in the match)
    // For SET1: any set is the deciding set (bestOf=1)
    // For SET3/SET5: check if we're at the final set position (i+1 === bestOfSets)
    const isDecidingSet = bestOfSets === 1 || i + 1 === bestOfSets;
    const setValidation = validateSetScore(sets[i], matchUpFormat, isDecidingSet, allowIncomplete);
    if (!setValidation.isValid) {
      return {
        isValid: false,
        error: `Set ${i + 1}: ${setValidation.error}`,
      };
    }
  }

  return { isValid: true };
}
