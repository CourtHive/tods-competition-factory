import { getTiebreakComplement } from '@Query/matchUp/getComplement';
import { parse } from '@Helpers/matchUpFormatCode/parse';

type ParseScoreArgs = {
  scoreString: string;
  tiebreakTo?: number;
  matchUpFormat?: string;
};

type ParsedSetString = {
  winningSide: number | undefined;
  side1TiebreakScore?: number;
  side2TiebreakScore?: number;
  side1Score?: number;
  side2Score?: number;
  setNumber: number;
};

type ParseSetArgs = {
  setNumber: number;
  set: string;
};

// utility function just to allow testing with string score entry
export function parseScoreString({ tiebreakTo = 7, scoreString = '', matchUpFormat }: ParseScoreArgs) {
  // Check if matchUpFormat indicates tiebreak-only sets (TB10, TB7, etc.)
  let isTiebreakOnlyFormat = false;
  if (matchUpFormat) {
    try {
      const parsed = parse(matchUpFormat);
      const tiebreakSetTo = parsed?.setFormat?.tiebreakSet?.tiebreakTo;
      const regularSetTo = parsed?.setFormat?.setTo;
      isTiebreakOnlyFormat = !!tiebreakSetTo && !regularSetTo;
    } catch (e) {
      // Ignore parse errors
    }
  }
  
  return scoreString
    ?.split(' ')
    .filter(Boolean)
    .map((set, index) => parseSet({ set, setNumber: index + 1 }));

  function parseSet({ set, setNumber }: ParseSetArgs): ParsedSetString {
    const inParentheses = /\(([^)]+)\)/;
    const inBrackets = /\[([^\]]+)\]/;
    const tiebreak = inParentheses.exec(set);
    const bracketed = inBrackets.exec(set);

    // Brackets can indicate two different things:
    // 1. Tiebreak-only set (TB10): [11-13] - entire set is tiebreak points
    // 2. Match tiebreak/supertiebreak as part of regular set: 7-5 5-7 [10-3]
    // We distinguish by checking if brackets START the set string
    const isTiebreakOnlySet = set?.startsWith('[') && bracketed;
    
    let side1Score: number | undefined;
    let side2Score: number | undefined;
    let side1TiebreakScore: number | undefined;
    let side2TiebreakScore: number | undefined;
    let winningSide: number | undefined;

    if (isTiebreakOnlySet) {
      // When set starts with brackets, it could be:
      // 1. Tiebreak-only set (TB10): [11-13] -> side1Score=11, side2Score=13
      // 2. Match tiebreak: [10-3] -> side1TiebreakScore=10, side2TiebreakScore=3
      // 
      // CRITICAL: Only treat as tiebreak-only format if matchUpFormat explicitly indicates it
      // Without matchUpFormat context, brackets always mean match tiebreak (traditional behavior)
      const bracketedScores = bracketed[1].split('-').map((score) => parseInt(score));
      
      if (isTiebreakOnlyFormat) {
        // Tiebreak-only format (TB10) with explicit matchUpFormat - scores go into side1Score/side2Score
        side1Score = bracketedScores[0];
        side2Score = bracketedScores[1];
        winningSide = (side1Score > side2Score && 1) || (side1Score < side2Score && 2) || undefined;
      } else {
        // Match tiebreak (no game scores) - scores go into tiebreak fields
        // This is the default/traditional interpretation of [N-M]
        side1TiebreakScore = bracketedScores[0];
        side2TiebreakScore = bracketedScores[1];
        winningSide = (side1TiebreakScore > side2TiebreakScore && 1) || (side1TiebreakScore < side2TiebreakScore && 2) || undefined;
      }
    } else {
      // Regular set or set with tiebreak game
      const setString = (tiebreak && set.replace(tiebreak[0], '')) || (bracketed && set.replace(bracketed[0], '')) || set;
      const setScores = setString.split('-').map((score) => parseInt(score));
      side1Score = setScores[0];
      side2Score = setScores[1];
      winningSide = (side1Score > side2Score && 1) || (side1Score < side2Score && 2) || undefined;

      // Handle tiebreak game score in parentheses: 7-6(5)
      if (tiebreak) {
        const setTiebreakLowScore = tiebreak[1];
        const side1TiebreakPerspective = getTiebreakComplement({
          lowValue: setTiebreakLowScore,
          isSide1: winningSide === 2,
          tiebreakTo,
        });
        if (Array.isArray(side1TiebreakPerspective)) {
          [side1TiebreakScore, side2TiebreakScore] = side1TiebreakPerspective;
        }
      }
      
      // Handle match tiebreak/supertiebreak in brackets (when not at start): 7-5 5-7 [10-3]
      if (bracketed && !isTiebreakOnlySet) {
        const matchTiebreakScores = bracketed[1].split('-').map((score) => parseInt(score));
        side1TiebreakScore = matchTiebreakScores[0];
        side2TiebreakScore = matchTiebreakScores[1];
      }
    }

    return {
      side1Score,
      side2Score,
      side1TiebreakScore,
      side2TiebreakScore,
      winningSide,
      setNumber,
    };
  }
}
