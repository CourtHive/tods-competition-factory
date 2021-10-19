import { generateScoreString } from '../../governors/scoreGovernor/generateScoreString';
import { analyzeMatchUp } from '../../governors/scoreGovernor/analyzeMatchUp';

function generateSetScores(setValues) {
  return setValues.map(
    (
      [side1Score, side2Score, side1TiebreakScore, side2TiebreakScore],
      index
    ) => {
      return {
        side1Score,
        side2Score,
        side1TiebreakScore,
        side2TiebreakScore,
        setNumber: index + 1,
      };
    }
  );
}

/**
 *
 * @param {object[]} setValues - array of values arrays [side1Score, side2Score, side1TiebreakScore, side2TiebreakScore]
 */

export function generateMatchUpOutcome({
  setValues,
  matchUpFormat = 'SET3-S:6/TB7',
}) {
  const generatedSets = generateSetScores(setValues);
  const sets = generatedSets.map((set) => {
    const { setNumber } = set;
    const { winningSide } = analyzeMatchUp({
      matchUp: {
        score: { sets: generatedSets },
        matchUpFormat,
      },
      setNumber,
    });
    return Object.assign(set, { winningSide });
  });
  const analysis = analyzeMatchUp({
    matchUp: { score: { sets }, matchUpFormat },
  });
  const { calculatedWinningSide: winningSide } = analysis;
  let scoreStringSide1;
  let scoreStringSide2;
  const outcome = {
    matchUpFormat,
    sets,
  };
  const winnerPerspective = generateScoreString(outcome);
  const loserPerspective = generateScoreString({
    ...outcome,
    reversed: true,
  });
  if (winningSide) {
    scoreStringSide1 = winningSide === 1 ? winnerPerspective : loserPerspective;
    scoreStringSide2 = winningSide === 1 ? loserPerspective : winnerPerspective;
  } else {
    scoreStringSide1 = winnerPerspective;
    scoreStringSide2 = loserPerspective;
  }
  const score = {
    sets,
    scoreStringSide1,
    scoreStringSide2,
  };
  Object.assign(outcome, { score, winningSide });
  return outcome;
}
