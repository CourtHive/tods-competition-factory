import { generateScoreString } from '../../drawEngine/governors/scoreGovernor/generateScoreString';
import { toBePlayed } from '../../fixtures/scoring/outcomes/toBePlayed';
import { parseScoreString } from '../utilities/parseScoreString';

import { INVALID_VALUES } from '../../constants/errorConditionConstants';

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
      outcome: Object.assign({}, toBePlayed, {
        winningSide,
        matchUpStatus,
      }),
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
