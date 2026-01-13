import { generateScoreString } from '../matchUps/generateScoreString';
import { toBePlayed } from '@Fixtures/scoring/outcomes/toBePlayed';
import { definedAttributes } from '@Tools/definedAttributes';
import { parseScoreString } from '@Tools/parseScoreString';
import { parse } from '@Helpers/matchUpFormatCode/parse';

// Constants
import { INVALID_VALUES } from '@Constants/errorConditionConstants';

/**
 * Generates TODS score object from parseable score string
 */
export function generateOutcomeFromScoreString(params) {
  const { matchUpFormat, matchUpStatus, winningSide, scoreString, setTBlast } = params;
  if (!scoreString)
    return {
      outcome: {
        ...toBePlayed,
        winningSide,
        matchUpStatus,
      },
    };
  if (winningSide && ![1, 2, undefined].includes(winningSide)) return { error: INVALID_VALUES, winningSide };

  const neutralParsedSets = scoreString && parseScoreString({ scoreString, matchUpFormat });
  
  // Check if score string uses bracket notation (tiebreak-only format)
  // Bracket notation [11-13] is already in side order (side1-side2), not winner-loser order
  const isBracketNotation = scoreString?.trim().startsWith('[');
  
  // If winningSide not provided and matchUpFormat is available, try to infer from parsed sets
  let inferredWinningSide = winningSide;
  if (!inferredWinningSide && matchUpFormat && neutralParsedSets) {
    const parsedFormat = parse(matchUpFormat);
    const isAggregateScoring = 
      parsedFormat?.setFormat?.based === 'A' || parsedFormat?.finalSetFormat?.based === 'A';
    
    if (isAggregateScoring) {
      // For aggregate scoring, sum all scores across all sets
      const aggregateTotals = neutralParsedSets.reduce(
        (totals: any, set: any) => {
          // Only count sets with side scores (not tiebreak-only sets)
          if (set.side1Score !== undefined || set.side2Score !== undefined) {
            totals.side1 += set.side1Score ?? 0;
            totals.side2 += set.side2Score ?? 0;
          }
          return totals;
        },
        { side1: 0, side2: 0 }
      );
      
      // Determine winner by aggregate totals
      if (aggregateTotals.side1 > aggregateTotals.side2) inferredWinningSide = 1;
      else if (aggregateTotals.side2 > aggregateTotals.side1) inferredWinningSide = 2;
      // If tied, check for final tiebreak set
      else {
        const tiebreakSet = neutralParsedSets.find(
          (set: any) => set.side1TiebreakScore !== undefined || set.side2TiebreakScore !== undefined
        );
        if (tiebreakSet) inferredWinningSide = tiebreakSet.winningSide;
      }
    } else {
      // Standard: count sets won by each side
      const setsWon = { side1: 0, side2: 0 };
      neutralParsedSets.forEach((set: any) => {
        if (set.winningSide === 1) setsWon.side1++;
        else if (set.winningSide === 2) setsWon.side2++;
      });
      
      // Determine match winner based on sets won
      if (setsWon.side1 > setsWon.side2) inferredWinningSide = 1;
      else if (setsWon.side2 > setsWon.side1) inferredWinningSide = 2;
    }
  }
  
  const score: any = {};
  
  // For aggregate scoring, score string is already in side order, not winner-loser order
  // Parse directly without generating/reversing score strings
  const parsedFormat = parse(matchUpFormat);
  const isAggregateScoring = 
    parsedFormat?.setFormat?.based === 'A' || parsedFormat?.finalSetFormat?.based === 'A';
  
  if (isBracketNotation || isAggregateScoring) {
    // Score string is already in side1-side2 order
    score.sets = parseScoreString({ scoreString, matchUpFormat });
    score.scoreStringSide1 = generateScoreString({
      sets: score.sets,
      matchUpFormat,
      setTBlast,
    });
    score.scoreStringSide2 = generateScoreString({
      sets: score.sets,
      reversed: true,
      matchUpFormat,
      setTBlast,
    });
  } else {
    // Traditional winner-loser order
    const winningScoreString = generateScoreString({
      sets: neutralParsedSets,
      matchUpFormat,
      setTBlast,
    });
    const losingScoreString = generateScoreString({
      sets: neutralParsedSets,
      reversed: true,
      matchUpFormat,
      setTBlast,
    });
    
    if (inferredWinningSide === 2) {
      score.scoreStringSide1 = losingScoreString;
      score.scoreStringSide2 = winningScoreString;
    } else {
      score.scoreStringSide1 = winningScoreString;
      score.scoreStringSide2 = losingScoreString;
    }
    score.sets = parseScoreString({ scoreString: score.scoreStringSide1, matchUpFormat });
  }

  return definedAttributes({
    outcome: {
      matchUpStatus,
      winningSide: inferredWinningSide,
      score,
    },
  });
}
