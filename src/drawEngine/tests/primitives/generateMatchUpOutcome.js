import drawEngine from '../../../drawEngine';

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
  const outcome = {
    matchUpFormat,
    sets: generateSetScores(setValues),
  };
  const sets = outcome.sets.map(set => {
    const { setNumber } = set;
    const { winningSide } = drawEngine.analyzeMatchUp({
      matchUp: outcome,
      setNumber,
    });
    return Object.assign(set, { winningSide });
  });
  Object.assign(outcome, { sets });
  const { calculatedWinningSide: winningSide } = drawEngine.analyzeMatchUp({
    matchUp: outcome,
  });
  const score = drawEngine.generateScoreString(outcome);
  Object.assign(outcome, { winningSide, score });
  return outcome;
}
