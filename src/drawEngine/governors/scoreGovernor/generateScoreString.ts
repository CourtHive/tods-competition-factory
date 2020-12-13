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
    winningSide,
    autoComplete,
    matchUpStatus,
    reversed = false,
    winnerFirst = true,
  } = props;
  const scoresInSideOrder = !winnerFirst || !winningSide || winningSide === 1;
  const reverseScores = reversed || !scoresInSideOrder;

  const outcomeString = getOutcomeString({ matchUpStatus });

  const setScores = sets?.sort(setSort).map(setString).join(' ') || '';

  if (!outcomeString) return setScores;
  if (winningSide === 2) return `${outcomeString} ${setScores}`;
  return `${setScores} ${outcomeString}`;

  function setString(currentSet) {
    const hasGameScores = (set) =>
      isNumeric(set?.side1Score) || isNumeric(set?.side2Score);
    const hasTiebreakScores = (set) =>
      isNumeric(set?.side1TiebreakScore) || isNumeric(set?.side2TiebreakScore);

    const isTiebreakSet =
      !hasGameScores(currentSet) && hasTiebreakScores(currentSet);

    const {
      side1Score,
      side2Score,
      side1TiebreakScore,
      side2TiebreakScore,
    } = currentSet;

    const t1 =
      side1TiebreakScore ||
      (isNumeric(side1TiebreakScore) || autoComplete ? 0 : '');
    const t2 =
      side2TiebreakScore ||
      (isNumeric(side2TiebreakScore) || autoComplete ? 0 : '');

    if (isTiebreakSet) {
      const tiebreakScore = reversed ? [t2, t1] : [t1, t2];
      return `[${tiebreakScore.join('-')}]`;
    }

    /*
    const tiebreakScores = [side1TiebreakScore, side2TiebreakScore].filter(
      tiebreakScore => {
        return tiebreakScore !== undefined && tiebreakScore !== false;
      }
    );
    */
    const lowTiebreakScore = Math.min(t1, t2);
    const tiebreak = lowTiebreakScore ? `(${lowTiebreakScore})` : '';

    const s1 = side1Score || (isNumeric(side1Score) || autoComplete ? 0 : '');
    const s2 = side2Score || (isNumeric(side2Score) || autoComplete ? 0 : '');

    return reverseScores
      ? `${[s2, s1].join('-')}${tiebreak}`
      : `${[s1, s2].join('-')}${tiebreak}`;
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
