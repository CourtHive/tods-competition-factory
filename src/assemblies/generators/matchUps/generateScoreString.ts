import { parse } from '@Helpers/matchUpFormatCode/parse';
import { isNumeric } from '@Tools/math';

// constants
import { ErrorType, MISSING_VALUE } from '@Constants/errorConditionConstants';
import {
  ABANDONED,
  DEAD_RUBBER,
  DEFAULTED,
  DOUBLE_DEFAULT,
  DOUBLE_WALKOVER,
  RETIRED,
  SUSPENDED,
  WALKOVER,
} from '@Constants/matchUpStatusConstants';

type GenerateScoreString = {
  addOutcomeString?: boolean;
  autoComplete?: boolean;
  matchUpStatus?: string;
  matchUpFormat?: string;
  winnerFirst?: boolean;
  winningSide?: number;
  reversed?: boolean;
  sets: any;
};
export function generateScoreString(
  params: GenerateScoreString,
): string | { error?: ErrorType; info?: ErrorType | string } {
  const {
    winnerFirst = true,
    addOutcomeString,
    reversed = false,
    matchUpStatus,
    matchUpFormat,
    autoComplete,
    winningSide,
    sets,
  } = params;

  if (!sets) return { error: MISSING_VALUE, info: 'missing sets' };

  const parsedFormat: any = matchUpFormat && parse(matchUpFormat);
  const { bestOf, finalSetFormat, setFormat } = parsedFormat ?? {};

  const scoresInSideOrder = !winnerFirst || !winningSide || winningSide === 1;
  const reverseScores = reversed || !scoresInSideOrder;

  const outcomeString = addOutcomeString ? getOutcomeString({ matchUpStatus }) : '';

  const setScores =
    sets
      ?.sort(setSort)
      .map(setString)
      .filter(Boolean) // handle situation where there are multiple empty set objects
      .join(' ') || '';

  if (!outcomeString) return setScores;
  if (winningSide === 2) return `${outcomeString} ${setScores}`;
  return `${setScores} ${outcomeString}`;

  function setString(currentSet) {
    const isFinalSet = bestOf && currentSet.setNumber === bestOf;
    const format = isFinalSet && finalSetFormat ? finalSetFormat : setFormat;
    const hasGameScores = (set) => isNumeric(set?.side1Score) || isNumeric(set?.side2Score);
    const hasTiebreakScores = (set) => isNumeric(set?.side1TiebreakScore) || isNumeric(set?.side2TiebreakScore);

    const isTiebreakSet = format?.tiebreakSet || (!hasGameScores(currentSet) && hasTiebreakScores(currentSet));

    const { side1Score, side2Score, side1TiebreakScore, side2TiebreakScore } = currentSet;

    const t1 = side1TiebreakScore || (isNumeric(side1TiebreakScore) || autoComplete ? 0 : '');
    const t2 = side2TiebreakScore || (isNumeric(side2TiebreakScore) || autoComplete ? 0 : '');

    if (isTiebreakSet) {
      const tiebreakScore = reverseScores ? [t2, t1] : [t1, t2];
      return `[${tiebreakScore.join('-')}]`;
    }

    const lowTiebreakScore = Math.min(t1, t2);
    const lowTiebreakSide = lowTiebreakScore === t1 ? 1 : 2;
    const tiebreak = lowTiebreakScore ? `(${lowTiebreakScore})` : '';

    const s1 = side1Score || (isNumeric(side1Score) || autoComplete ? 0 : '');
    const s2 = side2Score || (isNumeric(side2Score) || autoComplete ? 0 : '');

    const includeTiebreak = (sideNumber) => (lowTiebreakSide === sideNumber ? tiebreak : '');
    const ss1 = `${s1}${includeTiebreak(1)}`;
    const ss2 = `${s2}${includeTiebreak(2)}`;

    let scoreString = reverseScores ? `${[ss2, ss1].join('-')}` : `${[ss1, ss2].join('-')}`;

    if (['-', ' '].includes(scoreString)) scoreString = '';
    return scoreString;
  }
}

function getOutcomeString({ matchUpStatus }) {
  const outcomeStrings = {
    [RETIRED]: 'RET',
    [WALKOVER]: 'WO',
    [DOUBLE_DEFAULT]: 'DF/DF',
    [DOUBLE_WALKOVER]: 'WO/WO',
    [SUSPENDED]: 'SUS',
    [ABANDONED]: 'ABN',
    [DEFAULTED]: 'DEF',
    [DEAD_RUBBER]: 'DR',
  };

  return (matchUpStatus && outcomeStrings[matchUpStatus]) || '';
}

function setSort(a, b) {
  return a.setNumber - b.setNumber;
}
