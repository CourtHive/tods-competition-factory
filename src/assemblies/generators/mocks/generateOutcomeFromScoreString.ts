import { generateScoreString } from '../matchUps/generateScoreString';
import { toBePlayed } from '@Fixtures/scoring/outcomes/toBePlayed';
import { definedAttributes } from '@Tools/definedAttributes';
import { parseScoreString } from '@Tools/parseScoreString';

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
    // Count sets won by each side
    const setsWon = { side1: 0, side2: 0 };
    neutralParsedSets.forEach((set: any) => {
      if (set.winningSide === 1) setsWon.side1++;
      else if (set.winningSide === 2) setsWon.side2++;
    });
    
    // Determine match winner based on sets won
    if (setsWon.side1 > setsWon.side2) inferredWinningSide = 1;
    else if (setsWon.side2 > setsWon.side1) inferredWinningSide = 2;
  }
  
  const score: any = {};
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
  
  // For bracket notation, don't swap based on winningSide - it's already in side order
  if (isBracketNotation) {
    score.scoreStringSide1 = winningScoreString;
    score.scoreStringSide2 = losingScoreString;
  } else if (inferredWinningSide === 2) {
    score.scoreStringSide1 = losingScoreString;
    score.scoreStringSide2 = winningScoreString;
  } else {
    score.scoreStringSide1 = winningScoreString;
    score.scoreStringSide2 = losingScoreString;
  }
  score.sets = parseScoreString({ scoreString: score.scoreStringSide1, matchUpFormat });

  return definedAttributes({
    outcome: {
      matchUpStatus,
      winningSide: inferredWinningSide,
      score,
    },
  });
}
