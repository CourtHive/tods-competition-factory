import { getTiebreakComplement } from '@Query/matchUp/getComplement';

type ParseScoreArgs = {
  scoreString: string;
  tiebreakTo?: number;
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
export function parseScoreString({ tiebreakTo = 7, scoreString = '' }: ParseScoreArgs) {
  return scoreString
    ?.split(' ')
    .filter(Boolean)
    .map((set, index) => parseSet({ set, setNumber: index + 1 }));

  function parseSet({ set, setNumber }: ParseSetArgs): ParsedSetString {
    const inParentheses = /\(([^)]+)\)/;
    const inBrackets = /\[([^)]+)\]/;
    const tiebreak = inParentheses.exec(set);
    const supertiebreak = inBrackets.exec(set);

    const matchTiebreak =
      set?.startsWith('[') && supertiebreak && supertiebreak[1].split('-').map((sideScore) => parseInt(sideScore));

    const setString =
      (tiebreak && set.replace(tiebreak[0], '')) || (supertiebreak && set.replace(supertiebreak[0], '')) || set;
    const setScores = !matchTiebreak && setString.split('-').map((sideScore) => parseInt(sideScore));

    const winningSide = matchTiebreak
      ? (matchTiebreak[0] > matchTiebreak[1] && 1) || (matchTiebreak[0] < matchTiebreak[1] && 2) || undefined
      : (setScores[0] > setScores[1] && 1) || (setScores[0] < setScores[1] && 2) || undefined;

    const setTiebreakLowScore = tiebreak ? tiebreak[1] : undefined;

    const side1TiebreakPerspective =
      setTiebreakLowScore &&
      getTiebreakComplement({
        lowValue: setTiebreakLowScore,
        isSide1: winningSide === 2,
        tiebreakTo,
      });

    const setTiebreak = side1TiebreakPerspective ?? [];

    const [side1Score, side2Score] = setScores || [];
    const [side1TiebreakScore, side2TiebreakScore] = matchTiebreak || setTiebreak || [];

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
