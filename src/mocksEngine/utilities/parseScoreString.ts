import { getTiebreakComplement } from '../../matchUpEngine/getters/getComplement';

type ParseScoreArgs = {
  scoreString: string;
  tiebreakTo: number;
};

/*
type ParsedSetString = {
  side1Score: number;
  side2Score: number;
  side1TiebreakScore: number;
  side2TiebreakScore: number;
  winningSide: number;
  setNumber: number;
};
*/

// utility function just to allow testing with string score entry
export function parseScoreString({
  tiebreakTo = 7,
  scoreString,
}: ParseScoreArgs) {
  return scoreString
    .split(' ')
    .filter(Boolean)
    .map((set, index) => parseSet({ set, setNumber: index + 1 }));

  function parseSet({ set, setNumber }) {
    const matchTiebreak =
      set?.startsWith('[') &&
      set
        .split('[')[1]
        .split(']')[0]
        .split('-')
        .map((sideScore) => parseInt(sideScore));
    const setString =
      (set.includes('(') && set.split('(')[0]) ||
      (set.includes('[') && set.split('[')[0]) ||
      set;
    const setScores =
      !matchTiebreak &&
      setString.split('-').map((sideScore) => parseInt(sideScore));

    const winningSide = matchTiebreak
      ? (matchTiebreak[0] > matchTiebreak[1] && 1) ||
        (matchTiebreak[0] < matchTiebreak[1] && 2) ||
        undefined
      : (setScores[0] > setScores[1] && 1) ||
        (setScores[0] < setScores[1] && 2) ||
        undefined;

    const setTiebreakLowScore =
      set.includes('(') && set.split('(')[1].split(')')[0];

    const side1TiebreakPerspective =
      ![false, undefined].includes(setTiebreakLowScore) &&
      getTiebreakComplement({
        isSide1: winningSide === 2,
        lowValue: setTiebreakLowScore,
        tiebreakTo,
      });

    const setTiebreak = side1TiebreakPerspective || [];

    const [side1Score, side2Score] = setScores || [];
    const [side1TiebreakScore, side2TiebreakScore] =
      matchTiebreak || setTiebreak || [];

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
