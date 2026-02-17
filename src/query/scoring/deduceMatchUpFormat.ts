/**
 * Deduce matchUpFormat from a score string
 *
 * Uses tennis domain knowledge to infer the correct format code
 * from an observed score.
 *
 * @param scoreString - Score like "6-4 7-5" or "7-6(5) 6-4"
 * @returns Format code like "SET3-S:6/TB7" or "SET5-S:6/TB7-F:6"
 *
 * @example
 * deduceMatchUpFormat("6-4 6-2") // => "SET3-S:6/TB7"
 * deduceMatchUpFormat("7-6(5) 6-4") // => "SET3-S:6/TB7"
 * deduceMatchUpFormat("6-4 4-6 8-6") // => "SET5-S:6/TB7-F:6" (advantage final)
 * deduceMatchUpFormat("5-7 4-6 6-3 7-6(5) 8-6") // => "SET5-S:6/TB7-F:6"
 */
const DEFAULT_FORMAT = 'SET3-S:6/TB7';

export function deduceMatchUpFormat(scoreString: string): string {
  // Parse score into sets
  const setStrings = scoreString.split(/[\s,]+/).filter((s) => s.length > 0);

  if (setStrings.length === 0) {
    return DEFAULT_FORMAT;
  }

  // Determine best-of format from number of sets
  // Single set = bestOf:1 (unless RETIRED/INCOMPLETE, but we can't tell from score alone)
  let bestOf: number;
  if (setStrings.length === 1) {
    bestOf = 1;
  } else if (setStrings.length === 2) {
    bestOf = 3;
  } else {
    bestOf = 5;
  }

  // Parse sets to determine game threshold
  // Tennis logic: -S:6/TB7 is THE MOST COMMON format
  // Second most common: -S:TB10 (match tiebreak to 10 points)
  // Scores like 5-7, 7-5, 6-4, 6-3, 6-2, 6-1, 6-0 are all setTo=6
  // Scores like 10-8, 11-9, 12-10 are likely match tiebreaks (S:TB10)

  // First, check for match tiebreak (S:TB10)
  // Match tiebreak detection: if any set has score of 10 OR score > 10 with diff <= 2
  for (const set of setStrings) {
    const gamesOnly = set.replace(/\([^)]*\)/g, '');
    const gameScores = gamesOnly.match(/(\d+)/g)?.map((n) => Number.parseInt(n, 10)) || [];

    if (gameScores.length === 2) {
      const max = Math.max(...gameScores);
      const min = Math.min(...gameScores);
      const diff = max - min;

      // Match tiebreak detection logic from user:
      // - If either score is 10 → S:TB10
      // - If max > 10 AND diff <= 2 → S:TB10
      if (max === 10 || (max > 10 && diff <= 2)) {
        return `SET${bestOf}-S:TB10`;
      }
    }
  }

  // Not a match tiebreak, proceed with regular format deduction
  // Look for any set WITH a tiebreak notation - that definitively tells us setTo
  let setWithTiebreak: string | null = null;
  for (const set of setStrings) {
    if (/\(/.test(set)) {
      setWithTiebreak = set;
      break;
    }
  }

  let setTo: number;

  if (setWithTiebreak) {
    // We have a tiebreak set - use it to determine setTo
    // From TODS: SET3-S:4/TB7 means setTo:4, tiebreakAt:4 (but score shows as 4-3!)
    // From TODS: SET3-S:6/TB7 means setTo:6, tiebreakAt:6 (but score shows as 7-6!)
    //
    // User clarification: "setTo is minGames"
    // For "7-6(3)": Tied at 6-6, tiebreak is 7th game → setTo=6 (minGames)
    // For "4-3(7)": Tied at 3-3, tiebreak is 4th game → setTo=3 (minGames)
    //
    // Pattern: When maxGames = minGames + 1 (tiebreak played):
    // - They were tied at minGames-minGames
    // - Played tiebreak as the (minGames+1)th game
    // - Winner gets maxGames games in the score
    // - setTo = minGames (where the tie happened)
    const gamesOnly = setWithTiebreak.replace(/\([^)]*\)/g, '');
    const gameScores = gamesOnly.match(/(\d+)/g)?.map((n) => parseInt(n, 10)) || [];
    if (gameScores.length === 0) {
      return DEFAULT_FORMAT;
    }
    const maxGames = Math.max(...gameScores);
    const minGames = Math.min(...gameScores);

    if (maxGames === minGames + 1) {
      // Tiebreak was played: tied at minGames-minGames
      // setTo = minGames (the tied score before tiebreak)
      setTo = minGames;
    } else {
      // Shouldn't happen with tiebreak notation, but fallback
      setTo = maxGames - 1;
    }
  } else {
    // No tiebreak sets - need to deduce from game scores
    // Extract all game scores from all sets
    const allMaxScores: number[] = [];

    for (const set of setStrings) {
      const gamesOnly = set.replace(/\([^)]*\)/g, '');
      const gameScores = gamesOnly.match(/(\d+)/g)?.map((n) => parseInt(n, 10)) || [];
      if (gameScores.length > 0) {
        allMaxScores.push(Math.max(...gameScores));
      }
    }

    if (allMaxScores.length === 0) {
      return DEFAULT_FORMAT;
    }

    const overallMax = Math.max(...allMaxScores);

    // Tennis logic: if any set has 6 or 7 games, it's almost certainly setTo:6
    // Only deduce lower setTo if ALL sets are consistently below 6
    if (overallMax >= 6) {
      setTo = 6; // Standard tennis
    } else {
      // All sets below 6, so it's a shorter format (e.g., setTo:4)
      setTo = overallMax;
    }
  }

  // Check if final set is advantage (no tiebreak)
  // This happens when the last set has games > setTo + 1
  // Examples: 8-6, 9-7, 10-8, 11-9, 13-11 (final set advantage)
  //
  // IMPORTANT: Only check for advantage if match has 3+ sets
  // A 2-set score means 2-0 victory (match over), NOT a deciding set
  //
  // Deciding sets occur in:
  //   - bestOf:3 → 3rd set when tied 1-1 (3 sets total)
  //   - bestOf:5 → 5th set when tied 2-2 (5 sets total)
  //
  // So we check if setStrings.length >= 3 (works for both formats)
  let finalSetAdvantage = false;
  if (setStrings.length >= 3) {
    // For 3+ set matches, last set could be deciding set (if match was tied)
    const lastSet = setStrings.at(-1);
    if (!lastSet) {
      return `SET${bestOf}-S:${setTo}/TB7`;
    }
    const gamesOnly = lastSet.replace(/\([^)]*\)/g, '');
    const gameScores = gamesOnly.match(/(\d+)/g)?.map((n) => Number.parseInt(n, 10)) || [];

    if (gameScores.length === 2) {
      const maxGames = Math.max(...gameScores);
      const minGames = Math.min(...gameScores);

      // If last set has games > setTo + 1, it's advantage format
      // e.g., setTo=6 but last set is 8-6, 9-7, 10-8, etc.
      if (maxGames > setTo + 1 && maxGames - minGames === 2) {
        finalSetAdvantage = true;
      }
    }
  }

  // Build format string
  let baseFormat;
  if (setTo === 6) {
    baseFormat = `SET${bestOf}-S:6/TB7`;
  } else if (setTo === 4) {
    baseFormat = `SET${bestOf}-S:4/TB7`;
  } else if (setTo === 10) {
    baseFormat = `SET${bestOf}-S:10/TB7`;
  } else {
    baseFormat = `SET${bestOf}-S:${setTo}/TB7`;
  }

  // Add final set format if advantage
  if (finalSetAdvantage) {
    // Use -F:6 for advantage final set (no tiebreak)
    // NOT -F:T8 (that's a timed set, which v3 incorrectly used)
    baseFormat += `-F:${setTo}`;
  }

  return baseFormat;
}
