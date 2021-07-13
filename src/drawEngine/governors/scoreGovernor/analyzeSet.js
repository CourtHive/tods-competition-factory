import { getSetWinningSide } from './getSetWinningSide';

import {
  INVALID_GAME_SCORES,
  INVALID_WINNING_SIDE,
  MISSING_SET_OBJECT,
} from '../../../constants/errorConditionConstants';

export function analyzeSet(params) {
  const { setObject, matchUpScoringFormat } = params;
  if (!setObject) return { error: MISSING_SET_OBJECT };

  const { setNumber } = setObject || {};
  const { bestOf } = matchUpScoringFormat || {};
  const isDecidingSet = !!(setNumber && setNumber === bestOf);
  const setFormat =
    (isDecidingSet && matchUpScoringFormat?.finalSetFormat) ||
    matchUpScoringFormat?.setFormat;
  const expectTiebreakSet = !!setFormat?.tiebreakSet;
  const expectTimedSet = !!setFormat?.timed;
  const expectStandardSet = !expectTiebreakSet && !expectTimedSet;

  const isValidSetNumber = !!(setNumber && bestOf && setNumber <= bestOf);

  const sideGameScores = [setObject?.side1Score, setObject?.side2Score];
  const sidePointScores = [
    setObject?.side1PointScore,
    setObject?.side2PointScore,
  ];
  const sideTiebreakScores = [
    setObject?.side1TiebreakScore,
    setObject?.side2TiebreakScore,
  ];
  const sideGameScoresCount = sideGameScores.filter(
    (sideScore) => sideScore !== undefined
  ).length;
  const sidePointScoresCount = sidePointScores.filter(
    (sideScore) => sideScore !== undefined
  ).length;
  const sideTiebreakScoresCount = sideTiebreakScores.filter(
    (tiebreakScore) => tiebreakScore !== undefined
  ).length;

  const gameScoresCount = sideGameScores?.filter((s) => !isNaN(s)).length;
  const tiebreakScoresCount = sideTiebreakScores?.filter(
    (s) => !isNaN(s)
  ).length;

  const { tiebreakAt } = setFormat || {};
  const hasTiebreakCondition =
    tiebreakAt &&
    sideGameScores.filter((gameScore) => gameScore >= tiebreakAt).length === 2;

  const isTiebreakSet = !!(tiebreakScoresCount && !gameScoresCount);

  const isCompletedSet = !!(setObject && setObject?.winningSide);
  const { error: standardSetError, result: isValidStandardSetOutcome } =
    checkValidStandardSetOutcome({
      setObject,
      setFormat,
      sideGameScores,
      sideTiebreakScores,
    });

  const { error: tiebreakSetError, result: isValidTiebreakSetOutcome } =
    checkValidTiebreakSetOutcome({
      setObject,
      setFormat,
      sideTiebreakScores,
    });

  const isValidSetOutcome =
    (expectStandardSet && !isTiebreakSet && isValidStandardSetOutcome) ||
    (expectTiebreakSet && isTiebreakSet && isValidTiebreakSetOutcome);

  const isValidSet =
    isValidSetNumber &&
    !(expectTiebreakSet && !isTiebreakSet) &&
    !(expectStandardSet && isTiebreakSet) &&
    (!isCompletedSet || isValidSetOutcome);

  const winningSide = getSetWinningSide({
    isDecidingSet,
    isTiebreakSet,
    matchUpScoringFormat,
    setObject,
  });

  const analysis = {
    expectTiebreakSet,
    expectTimedSet,
    hasTiebreakCondition,
    isCompletedSet,
    isDecidingSet,
    isTiebreakSet,
    isValidSet,
    isValidSetNumber,
    isValidSetOutcome,
    setFormat,
    sideGameScores,
    sideGameScoresCount,
    sidePointScores,
    sidePointScoresCount,
    sideTiebreakScores,
    sideTiebreakScoresCount,
    winningSide,
  };

  if (setObject?.winningSide !== undefined) {
    if (isTiebreakSet) {
      analysis.isValidTiebreakSetOutcome = isValidTiebreakSetOutcome;
      if (!isValidTiebreakSetOutcome) {
        analysis.tiebreakSetError = tiebreakSetError;
      }
    } else {
      analysis.isValidStandardSetOutcome = isValidStandardSetOutcome;
      if (!isValidStandardSetOutcome) {
        analysis.standardSetError = standardSetError;
      }
    }
  }

  return analysis;
}

function checkValidStandardSetOutcome({
  setObject,
  setFormat,
  sideGameScores,
  sideTiebreakScores,
}) {
  if (!setObject) {
    return { result: false, error: MISSING_SET_OBJECT };
  }
  const expectTiebreakSet = !!setFormat?.tiebreakSet;
  const expectTimedSet = !!setFormat?.timed;
  if (!setFormat || expectTiebreakSet || expectTimedSet) {
    return { result: false, error: 'not standard set' };
  }

  const validGameScores = sideGameScores?.filter((s) => !isNaN(s)).length === 2;
  if (!validGameScores) return { result: false, error: INVALID_GAME_SCORES };

  const { setTo, tiebreakAt, tiebreakFormat, NoAD } = setFormat || {};
  const meetsSetTo = !!(
    setTo && sideGameScores?.find((gameScore) => gameScore >= setTo)
  );
  if (!meetsSetTo) return { result: false, error: INVALID_GAME_SCORES };

  const isValidWinningSide = [1, 2].includes(setObject?.winningSide);
  if (!setObject || !isValidWinningSide)
    return { result: false, error: INVALID_WINNING_SIDE };

  const winningSideIndex = setObject?.winningSide - 1;
  const losingSideIndex = 1 - winningSideIndex;
  const winningSideGameScore = sideGameScores[winningSideIndex];
  const losingSideGameScore = sideGameScores[losingSideIndex];
  const gamesDifference = winningSideGameScore - losingSideGameScore;
  const winningSideIsHighGameValue = winningSideGameScore > losingSideGameScore;
  if (!winningSideIsHighGameValue) {
    return { result: false, error: 'winningSide game scoreString is not high' };
  }

  const setTiebreakDefined = tiebreakAt && tiebreakFormat;
  const validTiebreakScores =
    sideTiebreakScores?.filter((s) => !isNaN(s)).length === 2;
  const winningSideTiebreakScore =
    sideTiebreakScores && sideTiebreakScores[winningSideIndex];
  const losingSideTiebreakScore =
    sideTiebreakScores && sideTiebreakScores[losingSideIndex];

  const hasTiebreakCondition =
    tiebreakAt &&
    sideGameScores.filter((gameScore) => gameScore >= tiebreakAt).length === 2;
  if (setTiebreakDefined) {
    const { NoAD: tiebreakNoAD, tiebreakTo } = tiebreakFormat;

    if (hasTiebreakCondition) {
      if (gamesDifference > 1) {
        return { result: false, error: 'invalid winning game scoreString (5)' };
      }
      if (!validTiebreakScores) {
        return { result: false, error: 'invalid tiebreak scores (1)' };
      }

      if (isNaN(tiebreakTo)) {
        return { result: false, error: 'tiebreakTo error' }; // TODO: test this
      }

      const meetsTiebreakTo = !!(
        tiebreakTo &&
        sideTiebreakScores?.find((tiebreakScore) => tiebreakScore >= tiebreakTo)
      );
      if (!meetsTiebreakTo) {
        return { result: false, error: 'invalid tiebreak scores (2)' };
      }

      const maxGameScore = tiebreakAt < setTo ? setTo : setTo + 1;
      if (winningSideGameScore > maxGameScore) {
        return { result: false, error: 'invalid winning game scoreString (1)' };
      }

      if (
        !winningSideTiebreakScore ||
        !losingSideTiebreakScore ||
        winningSideTiebreakScore < losingSideTiebreakScore
      ) {
        return {
          result: false,
          error: 'winningSide tiebreak value is not high',
        };
      }

      const minimumTiebreakWinMargin = tiebreakNoAD ? 1 : 2;
      const tiebreakDifference =
        winningSideTiebreakScore - losingSideTiebreakScore;
      const losingSideGameScoreAtTiebreakToThreshold =
        losingSideTiebreakScore >= tiebreakTo - 1;
      const invalidTiebreakScore =
        tiebreakDifference &&
        losingSideGameScoreAtTiebreakToThreshold &&
        tiebreakDifference < minimumTiebreakWinMargin;

      if (invalidTiebreakScore) {
        return { result: false, error: 'invalid tiebreak scores (3)' };
      }
    }

    const hasTiebreakGameScore = winningSideGameScore > setTo;
    if (
      hasTiebreakGameScore &&
      (!setTiebreakDefined || !hasTiebreakCondition)
    ) {
      return { result: false, error: 'invalid winning game scoreString (2)' };
    }
  }

  const minimumGamesWinMargin = NoAD ? 1 : 2;
  const losingSideGameScoreAtSetToThreshold = losingSideGameScore >= setTo - 1;
  const invalidWinningScore =
    gamesDifference &&
    losingSideGameScoreAtSetToThreshold &&
    !hasTiebreakCondition &&
    gamesDifference < minimumGamesWinMargin;

  if (invalidWinningScore) {
    return { result: false, error: 'invalid winning game scoreString (3)' };
  }

  if (gamesDifference > minimumGamesWinMargin && winningSideGameScore > setTo) {
    return { result: false, error: 'invalid winning game scoreString (4)' };
  }

  return { result: true };
}

function checkValidTiebreakSetOutcome({
  setObject,
  setFormat,
  sideTiebreakScores,
}) {
  if (!setObject) {
    return { result: false, error: MISSING_SET_OBJECT };
  }
  const expectTiebreakSet = !!setFormat?.tiebreakSet;
  const expectTimedSet = !!setFormat?.timed;
  if (!setFormat || !expectTiebreakSet || expectTimedSet) {
    return { result: false, error: 'not tiebreak set' };
  }

  const isValidWinningSide = [1, 2].includes(setObject?.winningSide);
  if (!setObject || !isValidWinningSide)
    return { result: false, error: INVALID_WINNING_SIDE };

  const { tiebreakSet } = setFormat || {};
  const { NoAD, tiebreakTo } = tiebreakSet || {};

  const validTiebreakScores =
    sideTiebreakScores?.filter((s) => !isNaN(s)).length === 2;
  if (!validTiebreakScores) {
    return { result: false, error: 'invalid tiebreak scores (1)' };
  }

  if (isNaN(tiebreakTo)) {
    return { result: false, error: 'tiebreakTo error' }; // TODO: test this
  }

  const meetsTiebreakTo = !!sideTiebreakScores?.find(
    (tiebreakScore) => tiebreakScore >= tiebreakTo
  );
  if (!meetsTiebreakTo) {
    return { result: false, error: 'invalid tiebreak scores (2)' };
  }

  const winningSideIndex = setObject?.winningSide - 1;
  const losingSideIndex = 1 - winningSideIndex;
  const winningSideTiebreakScore = sideTiebreakScores[winningSideIndex];
  const losingSideTiebreakScore = sideTiebreakScores[losingSideIndex];

  if (
    !winningSideTiebreakScore ||
    !losingSideTiebreakScore ||
    winningSideTiebreakScore < losingSideTiebreakScore
  ) {
    return { result: false, error: 'winningSide tiebreak value is not high' };
  }

  const minimumTiebreakWinMargin = NoAD ? 1 : 2;
  const tiebreakDifference = winningSideTiebreakScore - losingSideTiebreakScore;
  const losingSideGameScoreAtTiebreakToThreshold =
    losingSideTiebreakScore >= tiebreakTo - 1;
  const invalidTiebreakScore =
    tiebreakDifference &&
    losingSideGameScoreAtTiebreakToThreshold &&
    tiebreakDifference < minimumTiebreakWinMargin;

  if (invalidTiebreakScore) {
    return { result: false, error: 'invalid tiebreak scores (3)' };
  }

  return { result: true };
}
