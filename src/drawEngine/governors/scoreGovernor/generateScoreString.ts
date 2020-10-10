import {
  ABANDONED,
  DEAD_RUBBER,
  DEFAULTED,
  RETIRED,
  SUSPENDED,
  WALKOVER,
} from '../../../constants/matchUpStatusConstants';
import { isNumeric } from '../../../utilities/math';

/**
 *
 * @param {object[]} - sets - TODS sets object
 * @param {string} - matchUpStatus - TODS matchUpStatus ENUM
 * @param {number || string} - winningSide - TODS side declaration: 1 or 2
 * @param {boolean} - winnerFirst - generate string with winner on left side
 * @param {boolean} - autoComplete - whether to convert undefined values to 0
 *
 */
export function generateScoreString(props: any) {
  const {
    sets,
    matchUpStatus,
    winningSide,
    winnerFirst = true,
    autoComplete = true,
  } = props;
  const scoresInSideOrder = !winnerFirst || !winningSide || winningSide === 1;

  const outcomeString = getOutcomeString({ matchUpStatus });

  const setScores =
    sets
      ?.sort(setSort)
      .map(setString)
      .join(' ') || '';

  if (!outcomeString) return setScores;
  if (winningSide === 2) return `${outcomeString} ${setScores}`;
  return `${setScores} ${outcomeString}`;

  function setString(currentSet) {
    const hasGameScores = set =>
      isNumeric(set?.side1Score) || isNumeric(set?.side2Score);
    const hasTiebreakScores = set =>
      isNumeric(set?.side1TiebreakScore) || isNumeric(set?.side2TiebreakScore);

    const isTiebreakSet =
      !hasGameScores(currentSet) && hasTiebreakScores(currentSet);
    if (isTiebreakSet) {
      const tiebreakScore = scoresInSideOrder
        ? [
            currentSet.side1TiebreakScore || (autoComplete ? 0 : ''),
            currentSet.side2TiebreakScore || (autoComplete ? 0 : ''),
          ]
        : [
            currentSet.side2TiebreakScore || (autoComplete ? 0 : ''),
            currentSet.side1TiebreakScore || (autoComplete ? 0 : ''),
          ];
      return `[${tiebreakScore.join('-')}]`;
    }
    const {
      side1Score,
      side2Score,
      side1TiebreakScore,
      side2TiebreakScore,
    } = currentSet;

    const t1 = side1TiebreakScore || (autoComplete ? 0 : '');
    const t2 = side2TiebreakScore || (autoComplete ? 0 : '');
    const lowTiebreakScore = Math.min(t1, t2);
    const tiebreak = lowTiebreakScore ? `(${lowTiebreakScore})` : '';

    const s1 = side1Score || (autoComplete ? 0 : '');
    const s2 = side2Score || (autoComplete ? 0 : '');

    return scoresInSideOrder
      ? `${[s1, s2].join('-')}${tiebreak}`
      : `${[s2, s1].join('-')}${tiebreak}`;
  }
}

function getOutcomeString({ matchUpStatus }) {
  const outcomeStrings = {
    [RETIRED]: 'RET',
    [WALKOVER]: 'WO',
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
