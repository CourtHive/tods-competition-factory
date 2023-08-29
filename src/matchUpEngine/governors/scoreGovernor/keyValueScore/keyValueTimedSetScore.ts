import { ensureInt } from '../../../../utilities/ensureInt';
import { removeFromScore } from './keyValueUtilities';
import { processOutcome } from './processOutcome';

import { BACKSPACE, OUTCOMEKEYS, SCORE_JOINER, SPACE_KEY } from './constants';

export function keyValueTimedSetScore(params) {
  let { sets, info, scoreString, winningSide, matchUpStatus } = params;
  const { analysis, lowSide, value } = params;
  let updated, outcomeRemoved;
  if (!sets?.length && value !== BACKSPACE) sets = [{ setNumber: 1 }];
  const setIndex = sets.length - 1;

  if (OUTCOMEKEYS.includes(value)) {
    const lastSet = sets[sets.length - 1] || {};
    const { side1Score, side2Score } = lastSet;
    if (side1Score && !side2Score) {
      info = 'missing side2Score';
    } else if (analysis.finalSetIsComplete || winningSide) {
      info = 'final set is already complete';
    } else if (analysis.isIncompleteSetScore) {
      info = 'incomplete set scoreString';
    } else if (!analysis.isIncompleteSetScore) {
      ({ sets, scoreString, winningSide, matchUpStatus, updated } =
        processOutcome({
          lowSide,
          value,
          sets,
          scoreString,
          matchUpStatus,
          winningSide,
        }));
    }
  } else if (value === BACKSPACE) {
    ({ scoreString, sets, outcomeRemoved } = removeFromScore({
      analysis,
      scoreString,
      sets,
    }));
    if (scoreString?.trim() === '') {
      scoreString = scoreString.trim();
    }
    if (!scoreString) sets = [];

    if (outcomeRemoved) {
      const lastSet = sets[sets.length - 1] || {};
      const { side1Score, side2Score } = lastSet;
      if (side1Score && side2Score) {
        const winningSide =
          (side1Score > side2Score && 1) ||
          (side2Score > side1Score && 2) ||
          undefined;
        if (winningSide) {
          lastSet.winningSide = winningSide;
          sets.push({ setNumber: sets.length + 1 });
        }
      }
    }
    matchUpStatus = undefined;
    winningSide = undefined;
    updated = true;
  } else if (analysis.hasOutcome) {
    info = 'has outcome';
  } else if (winningSide) {
    return {
      sets,
      scoreString,
      winningSide,
      matchUpStatus,
      updated: false,
      info: 'matchUp is complete',
    };

    // SPACE_KEY indicates moving on to next set
  } else if (value === SPACE_KEY) {
    const lastSet = sets[sets.length - 1] || {};
    const { side1Score, side2Score } = lastSet;
    const setWinningSide =
      (side1Score > side2Score && 1) ||
      (side2Score > side1Score && 2) ||
      undefined;

    if (setWinningSide && !winningSide && !analysis.isIncompleteSetScore) {
      sets[sets.length - 1].winningSide = setWinningSide;
      sets.push({ setNumber: sets.length + 1 });
      scoreString += ' ';
      updated = true;
    }

    // SCORE_JOINGER is only valid if side1Score exists and side2Score doesn't exist
  } else if (
    value === SCORE_JOINER &&
    sets[setIndex].side1Score !== undefined &&
    sets[setIndex].side2Score === undefined &&
    scoreString &&
    analysis.isNumericEnding
  ) {
    scoreString += '-';
    sets[setIndex].side2Score = 0;

    matchUpStatus = undefined;
    winningSide = undefined;
    updated = true;
  } else if (!isNaN(value)) {
    let currentSetScore;

    if (sets[setIndex].side2Score === undefined) {
      const newValue = ensureInt(
        (sets[setIndex].side1Score || 0).toString() + value
      )
        .toString()
        .slice(0, 2);
      sets[setIndex].side1Score = ensureInt(newValue);
      currentSetScore = sets[setIndex].side1Score.toString();
      updated = true;
    } else {
      const newValue = ensureInt(
        (sets[setIndex].side2Score || 0).toString() + value
      )
        .toString()
        .slice(0, 2);
      sets[setIndex].side2Score = ensureInt(newValue);
      currentSetScore = [
        sets[setIndex].side1Score,
        sets[setIndex].side2Score,
      ].join('-');
      updated = true;
    }
    if (updated) {
      const priorSetScores = (sets.slice(0, setIndex) || [])
        .filter((set) => set)
        .map((set) => {
          const { side1Score, side2Score } = set;
          return [side1Score, side2Score].join('-');
        })
        .join(' ');
      if (priorSetScores) {
        scoreString = priorSetScores + ' ' + currentSetScore;
      } else {
        scoreString = currentSetScore;
      }
    }
  }

  return { sets, scoreString, winningSide, matchUpStatus, info, updated };
}
