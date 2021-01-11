import { INVALID_VALUES } from '../../constants/errorConditionConstants';
import { generateScoreString } from '../../drawEngine/governors/scoreGovernor/generateScoreString';
import { noScoreOutcome } from '../../fixtures/scoring/outcomes/noScoreOutcome';
import { parseScoreString } from '../utilities/parseScoreString';

/**
 *
 * Generates TODS score object from parseable score string
 *
 * @param {string} scoreString - parseable score string, e.g. '6-0 6-0'
 * @param {number} winningSide - optional - valid values are [1, 2, undefined]
 *
 */
export function generateOutcomeFromScoreString({
  scoreString,
  winningSide,
  matchUpStatus,
}) {
  if (!scoreString)
    return {
      outcome: Object.assign(noScoreOutcome, { winningSide, matchUpStatus }),
    };
  if (winningSide && ![1, 2, undefined].includes(winningSide))
    return { error: INVALID_VALUES, winningSide };

  const sets = scoreString && parseScoreString({ scoreString });
  const score = { sets };
  const winningScoreString = generateScoreString({ sets });
  const losingScoreString = generateScoreString({
    sets,
    reversed: true,
  });
  console.log({ winningSide, winningScoreString, losingScoreString });
  if (winningSide === 1) {
    score.scoreStringSide1 = winningScoreString;
    score.scoreStringSide2 = losingScoreString;
  } else if (winningSide === 2) {
    score.scoreStringSide1 = losingScoreString;
    score.scoreStringSide2 = winningScoreString;
  } else {
    score.scoreStringSide1 = scoreString;
  }
  return {
    outcome: {
      winningSide,
      score,
    },
  };
}
