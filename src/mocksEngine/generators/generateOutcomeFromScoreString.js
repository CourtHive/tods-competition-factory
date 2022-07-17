import { generateScoreString } from '../../matchUpEngine/generators/generateScoreString';
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
  matchUpFormat,
  matchUpStatus,
  winningSide,
  scoreString,
}) {
  if (!scoreString)
    return {
      outcome: {
        ...toBePlayed,
        winningSide,
        matchUpStatus,
      },
    };
  if (winningSide && ![1, 2, undefined].includes(winningSide))
    return { error: INVALID_VALUES, winningSide };

  const neutralParsedSets = scoreString && parseScoreString({ scoreString });
  const score = {};
  const winningScoreString = generateScoreString({
    sets: neutralParsedSets,
    matchUpFormat,
  });
  const losingScoreString = generateScoreString({
    sets: neutralParsedSets,
    reversed: true,
    matchUpFormat,
  });
  if (winningSide === 2) {
    score.scoreStringSide1 = losingScoreString;
    score.scoreStringSide2 = winningScoreString;
  } else {
    score.scoreStringSide1 = winningScoreString;
    score.scoreStringSide2 = losingScoreString;
  }
  score.sets = parseScoreString({ scoreString: score.scoreStringSide1 });

  return {
    outcome: {
      matchUpStatus,
      winningSide,
      score,
    },
  };
}
