import { getTiebreakComplement } from '../../governors/scoreGovernor/getComplement';

// utility function just to allow testing with string score entry
export function parseStringScore({ stringScore, tiebreakTo = 7 }) {
  return stringScore
    .split(' ')
    .filter((f) => f)
    .map((set, index) => parseSet({ set, setNumber: index + 1 }));

  function parseSet({ set, setNumber }) {
    const matchTiebreak =
      set.startsWith('[') && set.split('[')[1].split(']')[0].split('-');
    const setTiebreakLowScore =
      set.includes('(') && set.split('(')[1].split(')')[0];
    const side1TiebreakPerspective =
      ![false, undefined].includes(setTiebreakLowScore) &&
      getTiebreakComplement({
        isSide1: true,
        lowValue: setTiebreakLowScore,
        tiebreakTo,
      });
    const side2TiebreakPerspective =
      side1TiebreakPerspective && side1TiebreakPerspective.reverse();
    const setString = set.includes('(')
      ? set.split('(')[0]
      : set.includes('[')
      ? set.split('[')[0]
      : set;
    const setScores =
      !matchTiebreak &&
      setString.split('-').map((sideScore) => parseInt(sideScore));

    const winningSide =
      setScores[0] > setScores[1]
        ? 1
        : setScores[0] < setScores[1]
        ? 2
        : undefined;

    const setTiebreak =
      winningSide === 1
        ? side2TiebreakPerspective
        : winningSide === 2
        ? side1TiebreakPerspective
        : [];

    const [side1Score, side2Score] = setScores || [];
    const [tb1, tb2] = matchTiebreak || setTiebreak || [];
    const side2TiebreakScore = tb1 === 0 || tb1 ? tb1 : undefined;
    const side1TiebreakScore = tb2 === 0 || tb2 ? tb2 : undefined;

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
