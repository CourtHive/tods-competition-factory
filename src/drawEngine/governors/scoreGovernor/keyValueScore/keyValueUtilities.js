import { indices } from '../../../../utilities/arrays';
import { matchUpFormatCode } from 'tods-matchup-format-code';

import {
  SET_TIEBREAK_BRACKETS,
  MATCH_TIEBREAK_BRACKETS,
  OUTCOMES,
  MATCH_TIEBREAK_JOINER,
  SPACE_CHARACTER,
  WINNING_STATUSES,
} from './constants';

export function addOutcome({ score, lowSide, outcome }) {
  ({ score } = removeOutcome({ score }));

  if (lowSide === 2) {
    const lastScoreCharacter = score && score[score.length - 1];
    const spacer =
      lastScoreCharacter !== SPACE_CHARACTER ? SPACE_CHARACTER : '';
    return score + spacer + outcome;
  } else {
    return outcome + SPACE_CHARACTER + score;
  }
}

function removeOutcome({ score }) {
  if (!score) return { score: '' };

  let removed = false;

  for (const outcome of OUTCOMES) {
    const index = score?.indexOf(outcome);
    if (index === 0) {
      score = score.slice(outcome.length + 1).trim() + SPACE_CHARACTER;
    } else if (index > 0) {
      score = score.slice(0, index);
    }
    if (index >= 0) removed = true;
  }

  if (!score || !score.trim()) score = '';

  return { score, removed };
}

export function removeFromScore({ analysis, score, sets, lowSide }) {
  let newScore, newSets;
  if (!score) return { score, sets };

  const { score: outcomeRemoved, removed } = removeOutcome({ score });
  score = outcomeRemoved;
  if (removed) return { score, sets, outcomeRemoved: true };

  let lastSet = sets[sets.length - 1] || {};
  const setValuesCount = Object.values(lastSet).filter(f => f).length;
  if (lastSet.setNumber && setValuesCount === 1) {
    sets = sets.slice(0, sets.length - 1);
    lastSet = sets[sets.length - 1] || {};
  }
  const { tiebreakSet } = analysis.setFormat;
  const { tiebreakTo, NoAD } = tiebreakSet || {};

  const { isTiebreakEntry: isMatchTiebreak } = testTiebreakEntry({
    score,
    brackets: MATCH_TIEBREAK_BRACKETS,
  });

  const index = lastNumericIndex(score);
  if (index >= 0) {
    newScore = score.slice(0, index);
    const { isTiebreakEntry: openSetTiebreak } = testTiebreakEntry({
      score: newScore,
      brackets: SET_TIEBREAK_BRACKETS,
    });
    const {
      lastOpenBracketIndex: lastMatchTiebreakOpenBracketIndex,
      isTiebreakEntry: openMatchTiebreak,
    } = testTiebreakEntry({
      score: newScore,
      brackets: MATCH_TIEBREAK_BRACKETS,
    });
    const lastNewScoreChar = newScore && newScore[newScore.length - 1].trim();
    const remainingNumbers = newScore && !isNaN(lastNewScoreChar);
    let isIncompleteScore = analysis.isIncompleteSetScore;

    if (isMatchTiebreak && openMatchTiebreak) {
      const matchTiebreakScoreString = newScore.slice(
        lastMatchTiebreakOpenBracketIndex + 1
      );
      const splitScoreString = matchTiebreakScoreString.split(
        MATCH_TIEBREAK_JOINER
      );
      const side1TiebreakScore =
        (splitScoreString?.length > 0 &&
          splitScoreString[0] !== undefined &&
          !isNaN(parseInt(splitScoreString[0])) &&
          parseInt(splitScoreString[0])) ||
        undefined;
      const side2TiebreakScore =
        (splitScoreString?.length > 1 &&
          splitScoreString[1] !== undefined &&
          parseInt(splitScoreString[1])) ||
        undefined;
      const matchTiebreakScores = [side1TiebreakScore, side2TiebreakScore];

      if (side2TiebreakScore) {
        const highIndex = lowSide === 1 ? 1 : 0;

        matchTiebreakScores[highIndex] =
          matchTiebreakScores[1 - highIndex] + (NoAD ? 1 : 2);
        if (matchTiebreakScores[highIndex] < tiebreakTo)
          matchTiebreakScores[highIndex] = tiebreakTo;

        newScore = score.slice(0, lastMatchTiebreakOpenBracketIndex + 1);
        newScore += matchTiebreakScores.join(MATCH_TIEBREAK_JOINER);
      } else if (side1TiebreakScore !== undefined) {
        newScore = score.slice(0, lastMatchTiebreakOpenBracketIndex + 1);
        newScore += side1TiebreakScore;
      } else {
        newScore = score.slice(0, lastMatchTiebreakOpenBracketIndex);
        isIncompleteScore = true;
      }

      lastSet.side1TiebreakScore = matchTiebreakScores[0] || 0;
      lastSet.side2TiebreakScore = matchTiebreakScores[1] || 0;
    }

    if (!newScore.length) newScore = undefined;
    if (isIncompleteScore) {
      const side1Score = lastSet.side1Score?.toString();
      if (side1Score) {
        const newSide1Score = side1Score?.slice(0, side1Score.length - 1);
        lastSet.side1Score =
          (!isNaN(newSide1Score) && parseInt(newSide1Score)) || undefined;
        if (lastSet.side1Score === undefined) lastSet.side2Score = undefined;
      }
      if (analysis.isTimedSet) {
        newSets = lastSet.side1Score
          ? sets
          : sets?.slice(0, sets.length - 1) || [];
        newSets[sets.length - 1] = lastSet;
      } else {
        newSets = sets?.slice(0, sets.length - 1) || [];
      }
    } else if (remainingNumbers) {
      const side2Score = lastSet.side2Score?.toString();
      const side1Score = lastSet.side1Score?.toString();
      if (!analysis.isTiebreakEntry && !analysis.isMatchTiebreak) {
        if (lastSet.side2Score) {
          const newSide2Score = side2Score?.slice(0, side2Score.length - 1);
          lastSet.side2Score =
            (!isNaN(newSide2Score) && parseInt(newSide2Score)) || undefined;
        } else {
          const newSide1Score = side1Score?.slice(0, side1Score.length - 1);
          lastSet.side1Score =
            (!isNaN(newSide1Score) && parseInt(newSide1Score)) || undefined;
        }
      }
      if (analysis.isTimedSet) {
        if (lastSet.side1Score) {
          newSets = sets || [];
          newSets[sets.length - 1] = lastSet;
        } else {
          newSets = sets?.slice(0, sets.length - 1) || [];
        }
      } else {
        newSets = sets || [];
        newSets[sets.length - 1] = lastSet;
      }

      if (newSets[newSets.length - 1]) {
        Object.assign(newSets[newSets.length - 1], { winningSide: undefined });
      }
    } else if (openSetTiebreak) {
      newSets = sets || [];
      Object.assign(newSets[newSets.length - 1] || {}, {
        winningSide: undefined,
        side1TiebreakScore: undefined,
        side2TiebreakScore: undefined,
      });
    } else {
      if (isMatchTiebreak && !openMatchTiebreak) {
        newSets = sets?.slice(0, sets.length - 1) || [];
      } else {
        newSets = sets;
        newSets[sets.length - 1] = lastSet;
      }
      if (!isMatchTiebreak) {
        newSets[newSets.length - 1].side2Score = 0;
        newSets[newSets.length - 1].winningSide = undefined;
      }
    }

    return { score: newScore, sets: newSets };
  }

  return { score, sets };
}

export function testTiebreakEntry({ score, brackets = SET_TIEBREAK_BRACKETS }) {
  if (!score) return false;
  const [open, close] = brackets.split('');
  const splitScore = score.split('');
  const lastOpenBracketIndex = Math.max(...indices(open, splitScore));
  const lastCloseBracketIndex = Math.max(...indices(close, splitScore));
  const isTiebreakEntry = lastOpenBracketIndex > lastCloseBracketIndex;
  return { isTiebreakEntry, lastOpenBracketIndex };
}

export function checkValidMatchTiebreak({ score }) {
  if (!score) return false;
  const lastScoreChar = score && score[score.length - 1].trim();
  const isNumericEnding = score && !isNaN(lastScoreChar);

  const [open, close] = MATCH_TIEBREAK_BRACKETS.split('');
  const splitScore = score.split('');
  const lastOpenBracketIndex = Math.max(...indices(open, splitScore));
  const lastCloseBracketIndex = Math.max(...indices(close, splitScore));
  const lastJoinerIndex = Math.max(
    ...indices(MATCH_TIEBREAK_JOINER, splitScore)
  );
  const isValid =
    isNumericEnding &&
    lastOpenBracketIndex > lastCloseBracketIndex &&
    lastJoinerIndex > lastOpenBracketIndex;
  return isValid;
}

export function lastNumericIndex(str) {
  const arr = str.split('');
  const indices = arr.reduce((a, e, i) => {
    if (e.match(/\d+/g)) a.push(i);
    return a;
  }, []);
  return indices.pop();
}

export function getHighTiebreakValue({
  lowValue = 0,
  NoAD = false,
  tiebreakTo,
} = {}) {
  const winBy = NoAD ? 1 : 2;
  if (lowValue + 1 >= tiebreakTo) {
    return lowValue + winBy;
  }
  const highValue = parseInt(tiebreakTo);
  return highValue;
}

export function getMatchUpWinner({
  sets,
  winningSide,
  matchUpStatus,
  matchUpFormat,
}) {
  const matchUpScoringFormat = matchUpFormatCode.parse(matchUpFormat);
  const { bestOf } = matchUpScoringFormat;
  const scoreGoal = Math.ceil(bestOf / 2);
  const sideScores =
    sets &&
    sets.reduce(
      (scores, set) => {
        const { winningSide } = set;
        if (winningSide) scores[winningSide - 1]++;
        return scores;
      },
      [0, 0]
    );

  let matchUpWinningSide = sideScores?.indexOf(scoreGoal) + 1 || undefined;
  if (WINNING_STATUSES.includes(matchUpStatus) && winningSide) {
    matchUpWinningSide = winningSide;
  }
  return { matchUpWinningSide };
}
