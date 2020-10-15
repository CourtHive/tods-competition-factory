import { processOutcome } from './processOutcome';
import { removeFromScore } from './keyValueUtilities';

import { BACKSPACE, OUTCOMEKEYS, SCORE_JOINER, SPACE_KEY } from './constants';

export function keyValueTimedSetScore({
  analysis,
  lowSide,
  score,
  sets,
  winningSide,
  matchUpStatus,
  message,
  value,
}) {
  let updated, outcomeRemoved;
  if (!sets?.length && value !== BACKSPACE) sets = [{ setNumber: 1 }];
  const setIndex = sets.length - 1;

  if (OUTCOMEKEYS.includes(value)) {
    const lastSet = sets[sets.length - 1] || {};
    const { side1Score, side2Score } = lastSet;
    if (side1Score && !side2Score) {
      message = 'missing side2Score';
    } else if (analysis.finalSetIsComplete || winningSide) {
      message = 'final set is already complete';
    } else if (analysis.isIncompleteSetScore) {
      message = 'incomplete set score';
    } else if (!analysis.isIncompleteSetScore) {
      ({ sets, score, winningSide, matchUpStatus, updated } = processOutcome({
        lowSide,
        value,
        sets,
        score,
        matchUpStatus,
        winningSide,
      }));
    }
  } else if (value === BACKSPACE) {
    ({ score, sets, outcomeRemoved } = removeFromScore({
      analysis,
      score,
      sets,
    }));
    if (score?.trim() === '') {
      score = score.trim();
    }
    if (!score) sets = [];

    if (outcomeRemoved) {
      const lastSet = sets[sets.length - 1] || {};
      const { side1Score, side2Score } = lastSet;
      if (side1Score && side2Score) {
        const winningSide =
          side1Score > side2Score ? 1 : side2Score > side1Score ? 2 : undefined;
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
    message = 'has outcome';
  } else if (winningSide) {
    return {
      sets,
      score,
      winningSide,
      matchUpStatus,
      updated: false,
      message: 'matchUp is complete',
    };

    // SPACE_KEY indicates moving on to next set
  } else if (value === SPACE_KEY) {
    const lastSet = sets[sets.length - 1] || {};
    const { side1Score, side2Score } = lastSet;
    const setWinningSide =
      side1Score > side2Score ? 1 : side2Score > side1Score ? 2 : undefined;

    if (setWinningSide && !winningSide && !analysis.isIncompleteSetScore) {
      sets[sets.length - 1].winningSide = setWinningSide;
      sets.push({ setNumber: sets.length + 1 });
      score += ' ';
      updated = true;
    }

    // SCORE_JOINGER is only valid if side1Score exists and side2Score doesn't exist
  } else if (
    value === SCORE_JOINER &&
    sets[setIndex].side1Score !== undefined &&
    sets[setIndex].side2Score === undefined &&
    score &&
    analysis.isNumericEnding
  ) {
    score += '-';
    sets[setIndex].side2Score = 0;

    matchUpStatus = undefined;
    winningSide = undefined;
    updated = true;
  } else if (!isNaN(value)) {
    let currentSetScore;

    if (sets[setIndex].side2Score === undefined) {
      const newValue = parseInt(
        (sets[setIndex].side1Score || 0).toString() + value
      )
        .toString()
        .slice(0, 2);
      sets[setIndex].side1Score = parseInt(newValue);
      currentSetScore = sets[setIndex].side1Score.toString();
      updated = true;
    } else {
      const newValue = parseInt(
        (sets[setIndex].side2Score || 0).toString() + value
      )
        .toString()
        .slice(0, 2);
      sets[setIndex].side2Score = parseInt(newValue);
      currentSetScore = [
        sets[setIndex].side1Score,
        sets[setIndex].side2Score,
      ].join('-');
      updated = true;
    }
    if (updated) {
      const priorSetScores = (sets.slice(0, setIndex) || [])
        .map(set => {
          const { side1Score, side2Score } = set;
          return [side1Score, side2Score].join('-');
        })
        .join(' ');
      score = priorSetScores + ' ' + currentSetScore;
    }
  }

  return { sets, score, winningSide, matchUpStatus, message, updated };
}
