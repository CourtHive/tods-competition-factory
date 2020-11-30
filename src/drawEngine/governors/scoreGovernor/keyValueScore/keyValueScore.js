import { indices } from '../../../../utilities/arrays';

import {
  SET_TIEBREAK_BRACKETS,
  MATCH_TIEBREAK_BRACKETS,
  SPACE_CHARACTER,
  BACKSPACE,
  OUTCOMEKEYS,
  OUTCOME_COMPLETE,
  VALID_VALUE_KEYS,
  SCORE_JOINER,
  MATCH_TIEBREAK_JOINER,
  ALTERNATE_JOINERS,
  ZERO,
  CLOSERS,
  SPACE_KEY,
  STATUS_SUSPENDED,
  STATUS_INTERRUPTED,
  STATUS_ABANDONED,
} from './constants';

import { keyValueSetScore } from './keyValueSetScore';
import { processOutcome } from './processOutcome';

import {
  getMatchUpWinner,
  removeFromScore,
  getHighTiebreakValue,
} from './keyValueUtilities';
import { getWinningSide, getLeadingSide } from './winningSide';
import { processTiebreakSet } from './processTiebreakSet';
import { processIncompleteSetScore } from './processIncompleteSetScore';
import { getScoreAnalysis } from './scoreAnalysis';
import { keyValueTimedSetScore } from './keyValueTimedSetScore';
import {
  INCOMPLETE,
  TO_BE_PLAYED,
} from '../../../../constants/matchUpStatusConstants';

export function keyValueMatchUpScore(props) {
  const { matchUp } = props;
  const { matchUpFormat } = matchUp;
  const { score, sets, winningSide, matchUpStatus } = matchUp;
  const { auto, checkFormat, shiftFirst, lowSide, value } = props;
  const result = keyValueScore({
    score,
    sets,
    winningSide,
    matchUpStatus,
    matchUpFormat,
    lowSide,
    value,
    shiftFirst,
    auto,
    checkFormat,
  });

  let updatedMatchUp;
  if (result?.updated) {
    const {
      sets: updatedSets,
      score: updatedScore,
      winningSide: updatedWinningSide,
      matchUpStatus: updatedMatchUpStatus,
    } = result;
    updatedMatchUp = Object.assign({}, matchUp, {
      sets: updatedSets,
      score: updatedScore,
      winningSide: updatedWinningSide,
      matchUpStatus: updatedMatchUpStatus,
    });
  }
  return {
    updated: result.updated,
    message: result.message,
    matchUp: updatedMatchUp || matchUp,
  };
}

/* shiftFirst indicates that SHIFT key refers to first opponent, rather than second */
export function keyValueScore(props) {
  let { lowSide = 1, value } = props;
  let { score, sets, winningSide, matchUpStatus } = props;
  const { matchUpFormat, shiftFirst, auto = true } = props;

  let updated, message;
  const isShifted =
    (shiftFirst && lowSide === 2) || (!shiftFirst && lowSide === 1);

  if (!VALID_VALUE_KEYS.includes(value)) {
    return { updated: false, message: 'invalid key' };
  }

  if (shiftFirst) lowSide = 3 - lowSide;

  const { matchUpWinningSide } = getMatchUpWinner({
    sets,
    winningSide,
    matchUpStatus,
    matchUpFormat,
  });
  winningSide = matchUpWinningSide;

  const analysis = getScoreAnalysis({
    value,
    winningSide,
    score,
    sets,
    matchUpFormat,
  });

  if (ALTERNATE_JOINERS.includes(value)) value = SCORE_JOINER;
  if (
    analysis.hasOpener &&
    analysis.isTiebreakEntry &&
    !analysis.isTiebreakSet &&
    isShifted &&
    parseInt(value) === 0
  ) {
    analysis.isTiebreakCloser = true;
  }

  if (CLOSERS.includes(value) && analysis.hasOpener) {
    value = '';
  }

  if (CLOSERS.includes(value)) {
    // TODO: not sure this is necessary
    value = SPACE_KEY;
  }

  if (analysis.lastSetIsComplete) {
    const finalCharacter = score[score.length - 1];
    if (finalCharacter !== ' ') {
      score += ' ';
    }
  }

  if (analysis.isTimedSet) {
    ({
      message,
      sets,
      score,
      updated,
      matchUpStatus,
      winningSide,
    } = keyValueTimedSetScore({
      analysis,
      lowSide,
      score,
      sets,
      matchUpStatus,
      winningSide,
      value,
    }));
  } else if (OUTCOMEKEYS.includes(value)) {
    if (analysis.finalSetIsComplete || winningSide) {
      message = 'final set is already complete';
    } else if (!analysis.isTiebreakEntry && !analysis.isIncompleteSetScore) {
      ({ sets, score, matchUpStatus, winningSide, updated } = processOutcome({
        lowSide,
        sets,
        score,
        matchUpStatus,
        winningSide,
        value,
      }));
    } else if (analysis.isTiebreakEntry || analysis.isIncompleteSetScore) {
      message = 'incomplete set score or tiebreak entry';
    } else {
      console.log('handle case', { value });
    }
  } else if (value === BACKSPACE) {
    updated = true;
    ({ score, sets } = removeFromScore({
      analysis,
      score,
      sets,
      lowSide,
      auto,
    }));
    if (!score) sets = [];
    matchUpStatus = undefined;
    winningSide = undefined;
  } else if (analysis.hasOutcome) {
    message = 'has outcome';
  } else if (value === SCORE_JOINER && !analysis.isMatchTiebreakEntry) {
    if (
      !analysis.isSetTiebreakEntry ||
      (analysis.isSetTiebreakEntry && !analysis.isNumericEnding)
    ) {
      updated = true;
      ({ score, sets } = removeFromScore({
        analysis,
        score,
        sets,
        lowSide,
        auto,
      }));
      matchUpStatus = undefined;
    }
  } else if (
    value === MATCH_TIEBREAK_JOINER &&
    analysis.isMatchTiebreakEntry &&
    !analysis.isSetTiebreakEntry
  ) {
    if (analysis.matchTiebreakHasJoiner) {
      message = 'existing joiner';
    } else if (analysis.isNumericEnding) {
      updated = true;
      score += MATCH_TIEBREAK_JOINER;
    }
  } else if ([SCORE_JOINER, MATCH_TIEBREAK_JOINER].includes(value)) {
    message = 'invalid location for joiner';
  } else if (winningSide) {
    return { updated: false, message: 'matchUp is complete' };
  } else if (analysis.isIncompleteSetScore) {
    if (analysis.isNumericValue) {
      ({ sets, score, updated } = processIncompleteSetScore({
        analysis,
        score,
        sets,
        value,
      }));
    }
  } else if (analysis.isInvalidMatchTiebreakValue) {
    message = 'invalid matchUp tiebreak character';
  } else if (analysis.isInvalidSetTiebreakValue) {
    message = 'invalid set tiebreak character';
  } else if (analysis.isTiebreakCloser) {
    const brackets = analysis.isSetTiebreakEntry
      ? SET_TIEBREAK_BRACKETS
      : MATCH_TIEBREAK_BRACKETS;
    const close = brackets.split('').reverse()[0];
    const open = brackets.split('')[0];
    const set = sets[sets.length - 1];

    const { tiebreakFormat } = analysis.setFormat;
    const { tiebreakTo, NoAD } = tiebreakFormat || {};
    const leadingSide = getLeadingSide({ set });

    if (!analysis.isTiebreakSet) {
      const lowTiebreakScore = parseInt(score.split(open).reverse()[0]);
      const highTiebreakScore = getHighTiebreakValue({
        lowValue: lowTiebreakScore,
        tiebreakTo,
        NoAD,
      });
      if (leadingSide === 1) {
        set.side1TiebreakScore = highTiebreakScore;
        set.side2TiebreakScore = lowTiebreakScore;
      } else {
        set.side1TiebreakScore = lowTiebreakScore;
        set.side2TiebreakScore = highTiebreakScore;
      }
    }

    score = (score || '') + close;
    if (!analysis.isDecidingSet) score += SPACE_CHARACTER;

    const winningSide = getWinningSide({ analysis, set });
    set.winningSide = winningSide || undefined;

    updated = true;
  } else if (analysis.isTiebreakSetValue) {
    ({ message, score, sets, updated } = processTiebreakSet({
      analysis,
      auto,
      lowSide,
      score,
      sets,
      value,
    }));
  } else if (analysis.isSetTiebreakEntry) {
    const [open] = SET_TIEBREAK_BRACKETS.split('');
    const lastOpenBracketIndex = Math.max(...indices(open, score.split('')));
    const tiebreakValue = score.slice(lastOpenBracketIndex + 1);
    const hasZeroStart = tiebreakValue && parseInt(tiebreakValue) === ZERO;
    const newTiebreakValue = parseInt(
      tiebreakValue ? tiebreakValue + value : value
    );

    const { tiebreakFormat } = analysis.setFormat;
    const { tiebreakTo, NoAD } = tiebreakFormat || {};

    if (!hasZeroStart && tiebreakValue.length < 2) {
      if (NoAD && newTiebreakValue > tiebreakTo - 1) {
        message = 'invalid low value for NoAD tiebreak';
      } else {
        updated = true;
        score = (score || '') + value;
      }
    } else {
      message = hasZeroStart
        ? 'tiebreak begins with zero'
        : 'tiebreak digit limit';
    }
  } else if (analysis.isCloser) {
    message = `invalid key: ${value}`;
  } else if (analysis.isGameScoreEntry) {
    message = 'game score entry';
  } else {
    if (analysis.lastSetIsComplete || !sets.length) {
      updated = true;
      const { score: newScore, set } = keyValueSetScore({
        analysis,
        lowSide,
        score,
        value: parseInt(value),
      });
      if (set) set.setNumber = sets?.length + 1 || 1;
      sets = sets?.concat(set).filter(f => f) || [set];
      score = newScore || undefined;
    } else {
      console.log('error: unknown outcome');
    }
  }

  if (updated) {
    sets = sets?.filter(f => f);
    const { matchUpWinningSide } = getMatchUpWinner({
      sets,
      winningSide,
      matchUpStatus,
      matchUpFormat,
    });
    winningSide = matchUpWinningSide;
    if (
      matchUpWinningSide &&
      (!matchUpStatus || [TO_BE_PLAYED, INCOMPLETE].includes(matchUpStatus))
    ) {
      matchUpStatus = OUTCOME_COMPLETE;
      sets = sets.filter(set => {
        const {
          side1Score,
          side2Score,
          side1TiebreakScore,
          side2TiebreakScore,
        } = set;
        return (
          side1Score || side2Score || side1TiebreakScore || side2TiebreakScore
        );
      });
    } else if (
      score &&
      !winningSide &&
      ![STATUS_SUSPENDED, STATUS_ABANDONED, STATUS_INTERRUPTED].includes(
        matchUpStatus
      )
    ) {
      matchUpStatus = undefined;
    }
    return { updated, score, sets, winningSide, matchUpStatus, message };
  }

  return { updated, score, sets, winningSide, matchUpStatus, message };
}
