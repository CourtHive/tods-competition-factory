import { processIncompleteSetScore } from './processIncompleteSetScore';
import { keyValueTimedSetScore } from './keyValueTimedSetScore';
import { getWinningSide, getLeadingSide } from './winningSide';
import { arrayIndices } from '../../../../utilities/arrays';
import { processTiebreakSet } from './processTiebreakSet';
import { keyValueSetScore } from './keyValueSetScore';
import { getScoreAnalysis } from './scoreAnalysis';
import { processOutcome } from './processOutcome';
import {
  getMatchUpWinner,
  removeFromScore,
  getHighTiebreakValue,
} from './keyValueUtilities';

import {
  INCOMPLETE,
  TO_BE_PLAYED,
} from '../../../../constants/matchUpStatusConstants';
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

export function keyValueMatchUpScore(params) {
  const { auto, checkFormat, shiftFirst, lowSide, value, matchUp } = params;
  const { score, winningSide, matchUpStatus, matchUpFormat } = matchUp;
  const scoreString = matchUp.scoreString || score?.scoreStringSide1;
  const sets = matchUp.sets || score?.sets;
  const result = keyValueScore({
    scoreString,
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
    const { sets, scoreString, winningSide, matchUpStatus } = result;
    updatedMatchUp = {
      ...matchUp,
      sets, // required for present test suites
      scoreString, // required for present test suites
      winningSide,
      matchUpStatus,
      // TODO: this should use the autocomplete function of matchUpScore
      // and the expected behavior is therefore different than keyValueScore
      score: { sets, scoreStringSide1: scoreString },
    };
  }
  return {
    updated: result.updated,
    info: result.info,
    matchUp: updatedMatchUp || matchUp,
  };
}

/* shiftFirst indicates that SHIFT key refers to first opponent, rather than second */
export function keyValueScore(params) {
  let { lowSide = 1, value } = params;
  let { scoreString, sets, winningSide, matchUpStatus } = params;
  const { matchUpFormat, shiftFirst, auto = true } = params;

  let updated, info;
  const isShifted =
    (shiftFirst && lowSide === 2) || (!shiftFirst && lowSide === 1);

  if (!VALID_VALUE_KEYS.includes(value)) {
    return { updated: false, info: 'invalid key' };
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
    scoreString,
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
    const finalCharacter =
      scoreString?.length && scoreString[scoreString.length - 1];
    if (scoreString && finalCharacter !== ' ') {
      scoreString += ' ';
    }
  }

  if (analysis.isTimedSet) {
    ({ info, sets, scoreString, updated, matchUpStatus, winningSide } =
      keyValueTimedSetScore({
        analysis,
        lowSide,
        scoreString,
        sets,
        matchUpStatus,
        winningSide,
        value,
      }));
  } else if (OUTCOMEKEYS.includes(value)) {
    if (analysis.finalSetIsComplete || winningSide) {
      info = 'final set is already complete';
    } else if (!analysis.isTiebreakEntry && !analysis.isIncompleteSetScore) {
      ({ sets, scoreString, matchUpStatus, winningSide, updated } =
        processOutcome({
          lowSide,
          sets,
          scoreString,
          matchUpStatus,
          winningSide,
          value,
        }));
    } else if (analysis.isTiebreakEntry || analysis.isIncompleteSetScore) {
      info = 'incomplete set scoreString or tiebreak entry';
    } else {
      console.log('handle case', { value });
    }
  } else if (value === BACKSPACE) {
    updated = true;
    ({ scoreString, sets } = removeFromScore({
      analysis,
      scoreString,
      sets,
      lowSide,
      auto,
    }));
    if (!scoreString) sets = [];
    matchUpStatus = undefined;
    winningSide = undefined;
  } else if (analysis.hasOutcome) {
    info = 'has outcome';
  } else if (value === SCORE_JOINER && !analysis.isMatchTiebreakEntry) {
    if (
      !analysis.isSetTiebreakEntry ||
      (analysis.isSetTiebreakEntry && !analysis.isNumericEnding)
    ) {
      updated = true;
      ({ scoreString, sets } = removeFromScore({
        analysis,
        scoreString,
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
      info = 'existing joiner';
    } else if (analysis.isNumericEnding) {
      updated = true;
      scoreString += MATCH_TIEBREAK_JOINER;
    }
  } else if ([SCORE_JOINER, MATCH_TIEBREAK_JOINER].includes(value)) {
    info = 'invalid location for joiner';
  } else if (winningSide) {
    return { updated: false, info: 'matchUp is complete' };
  } else if (analysis.isIncompleteSetScore) {
    if (analysis.isNumericValue) {
      ({ sets, scoreString, updated } = processIncompleteSetScore({
        analysis,
        scoreString,
        sets,
        value,
      }));
    }
  } else if (analysis.isInvalidMatchTiebreakValue) {
    info = 'invalid matchUp tiebreak character';
  } else if (analysis.isInvalidSetTiebreakValue) {
    info = 'invalid set tiebreak character';
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
      const lowTiebreakScore = parseInt(scoreString.split(open).reverse()[0]);
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

    scoreString = (scoreString || '') + close;
    if (!analysis.isDecidingSet) scoreString += SPACE_CHARACTER;

    const winningSide = getWinningSide({ analysis, set });
    set.winningSide = winningSide || undefined;

    updated = true;
  } else if (analysis.isTiebreakSetValue) {
    ({ info, scoreString, sets, updated } = processTiebreakSet({
      analysis,
      auto,
      lowSide,
      scoreString,
      sets,
      value,
    }));
  } else if (analysis.isSetTiebreakEntry) {
    const [open] = SET_TIEBREAK_BRACKETS.split('');
    const lastOpenBracketIndex = Math.max(
      ...arrayIndices(open, scoreString.split(''))
    );
    const tiebreakValue = scoreString.slice(lastOpenBracketIndex + 1);
    const hasZeroStart = tiebreakValue && parseInt(tiebreakValue) === ZERO;
    const newTiebreakValue = parseInt(
      tiebreakValue ? tiebreakValue + value : value
    );

    const { tiebreakFormat } = analysis.setFormat;
    const { tiebreakTo, NoAD } = tiebreakFormat || {};

    if (!hasZeroStart && tiebreakValue.length < 2) {
      if (NoAD && newTiebreakValue > tiebreakTo - 1) {
        info = 'invalid low value for NoAD tiebreak';
      } else {
        updated = true;
        scoreString = (scoreString || '') + value;
      }
    } else {
      info = hasZeroStart
        ? 'tiebreak begins with zero'
        : 'tiebreak digit limit';
    }
  } else if (analysis.isCloser) {
    info = `invalid key: ${value}`;
  } else if (analysis.isGameScoreEntry) {
    info = 'game scoreString entry';
  } else {
    if (analysis.lastSetIsComplete || !sets.length) {
      updated = true;
      const { scoreString: newScore, set } = keyValueSetScore({
        analysis,
        lowSide,
        scoreString,
        value: parseInt(value),
      });
      if (set) set.setNumber = sets?.length + 1 || 1;
      sets = sets?.concat(set).filter(Boolean) || [set];
      scoreString = newScore || undefined;
    } else {
      console.log('error: unknown outcome');
    }
  }

  if (updated) {
    sets = sets?.filter(Boolean);
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
      sets = sets.filter((set) => {
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
      scoreString &&
      !winningSide &&
      ![STATUS_SUSPENDED, STATUS_ABANDONED, STATUS_INTERRUPTED].includes(
        matchUpStatus
      )
    ) {
      matchUpStatus = undefined;
    }
    return { updated, scoreString, sets, winningSide, matchUpStatus, info };
  }

  return { updated, scoreString, sets, winningSide, matchUpStatus, info };
}
