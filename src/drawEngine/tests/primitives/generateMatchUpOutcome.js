import drawEngine from '../../sync';

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

// SCORE: everywhere this method is used needs to be updated to expect object instead of string
export function generateMatchUpOutcome({
  setValues,
  matchUpFormat = 'SET3-S:6/TB7',
}) {
  const outcome = {
    matchUpFormat,
    sets: generateSetScores(setValues),
  };
  const sets = outcome.sets.map((set) => {
    const { setNumber } = set;
    const { winningSide } = drawEngine.analyzeMatchUp({
      matchUp: outcome,
      setNumber,
    });
    return Object.assign(set, { winningSide });
  });
  Object.assign(outcome, { sets });
  const analysis = drawEngine.analyzeMatchUp({ matchUp: outcome });
  const { calculatedWinningSide: winningSide } = analysis;
  let scoreStringSide1;
  let scoreStringSide2;
  const winnerPerspective = drawEngine.generateScoreString(outcome);
  const loserPerspective = drawEngine.generateScoreString(
    Object.assign({}, outcome, { reversed: true })
  );
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
