import { generateScoreString } from '../matchUps/generateScoreString';
import { toBePlayed } from '@Fixtures/scoring/outcomes/toBePlayed';
import { definedAttributes } from '@Tools/definedAttributes';
import { parseScoreString } from '@Tools/parseScoreString';

// Constants
import { INVALID_VALUES } from '@Constants/errorConditionConstants';

/**
 * Generates TODS score object from parseable score string
 */
export function generateOutcomeFromScoreString(params) {
  const { matchUpFormat, matchUpStatus, winningSide, scoreString } = params;
  if (!scoreString)
    return {
      outcome: {
        ...toBePlayed,
        winningSide,
        matchUpStatus,
      },
    };
  if (winningSide && ![1, 2, undefined].includes(winningSide)) return { error: INVALID_VALUES, winningSide };

  const neutralParsedSets = scoreString && parseScoreString({ scoreString });
  const score: any = {};
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

  return definedAttributes({
    outcome: {
      matchUpStatus,
      winningSide,
      score,
    },
  });
}
