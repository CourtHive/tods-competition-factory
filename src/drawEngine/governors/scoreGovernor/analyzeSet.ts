interface SetAnalysisInterface {
  setObject: any;
  matchUpScoringFormat: any;
}

export function analyzeSet(props: SetAnalysisInterface) {
  const {setObject, matchUpScoringFormat} = props;
  const { setNumber } = setObject || {};
  const { bestOf } = matchUpScoringFormat || {};
  const isDecidingSet = !!(setNumber && setNumber === bestOf);
  const setFormat = (isDecidingSet && matchUpScoringFormat?.finalSetFormat) || matchUpScoringFormat?.setFormat;
  const expectTiebreakSet = !!setFormat?.tiebreakSet;
  const expectTimedSet = !!setFormat?.timed;
  const expectStandardSet = !expectTiebreakSet && !expectTimedSet;

  const isValidSetNumber = !!(setNumber && bestOf && setNumber <= bestOf);

  const sideGameScores = [setObject?.side1Score, setObject?.side2Score];
  const sidePointScores = [setObject?.side1PointScore, setObject?.side2PointScore];
  const sideTiebreakScores = [setObject?.side1TiebreakScore, setObject?.side2TiebreakScore];
  const sideGameScoresCount = sideGameScores.filter(sideScore => sideScore !== undefined).length;
  const sidePointScoresCount = sidePointScores.filter(sideScore => sideScore !== undefined).length;
  const sideTiebreakScoresCount = sideTiebreakScores.filter(tiebreakScore => tiebreakScore !== undefined).length;
  
  const gameScoresCount = sideGameScores?.filter(s=>!isNaN(s)).length;
  const tiebreakScoresCount = sideTiebreakScores?.filter(s=>!isNaN(s)).length;

  const isTiebreakSet = !!(tiebreakScoresCount && !gameScoresCount);
  
  const isCompletedSet = !!(setObject && setObject?.winningSide);
  const {
    error: standardSetError,
    result: isValidStandardSetOutcome,
  } = checkValidStandardSetOutcome({ setObject, setFormat, sideGameScores, sideTiebreakScores });

  const {
    error: tiebreakSetError,
    result: isValidTiebreakSetOutcome,
  } = checkValidTiebreakSetOutcome({ setObject, setFormat, sideTiebreakScores });

  const isValidSetOutcome =
    (expectStandardSet && !isTiebreakSet && isValidStandardSetOutcome) ||
    (expectTiebreakSet && isTiebreakSet && isValidTiebreakSetOutcome);

  const isValidSet = isValidSetNumber &&
    !(expectTiebreakSet && !isTiebreakSet) &&
    !(expectStandardSet && isTiebreakSet) &&
    (!isCompletedSet || isValidSetOutcome);

  return {
    isDecidingSet, isCompletedSet,
    setFormat, standardSetError, tiebreakSetError,
    isValidSet, isValidSetNumber, isValidSetOutcome,
    isTiebreakSet, expectTiebreakSet, expectTimedSet,
    sideGameScores, sidePointScores, sideTiebreakScores,
    isValidStandardSetOutcome, isValidTiebreakSetOutcome,
    sideGameScoresCount, sidePointScoresCount, sideTiebreakScoresCount,
  }
}

function checkValidStandardSetOutcome({ setObject, setFormat, sideGameScores, sideTiebreakScores }) {
  if (!setObject) {
    return { result: false, error: 'missing setObject' };
  }
  const expectTiebreakSet = !!setFormat?.tiebreakSet;
  const expectTimedSet = !!setFormat?.timed;
  if (!setFormat || expectTiebreakSet || expectTimedSet) {
    return { result: false, error: 'not standard set' };
  }

  const validGameScores = sideGameScores?.filter(s=>!isNaN(s)).length === 2;
  if (!validGameScores) return { result: false, error: 'invalid game scores' };

  const { setTo, tiebreakAt, tiebreakFormat, NoAD } = setFormat || {};
  const meetsSetTo = !!(setTo && sideGameScores?.find(gameScore => gameScore >= setTo));
  if (!meetsSetTo) return { result: false, error: 'invalid game scores' };

  const isValidWinningSide = [1, 2].includes(setObject?.winningSide);
  if (!setObject || !isValidWinningSide) return { result: false, error: 'invalid winningSide' };

  const winningSideIndex = setObject?.winningSide - 1;
  const losingSideIndex = 1 - winningSideIndex;
  const winningSideGameScore = sideGameScores[winningSideIndex];
  const losingSideGameScore = sideGameScores[losingSideIndex];
  const gamesDifference = winningSideGameScore - losingSideGameScore;
  const winningSideIsHighGameValue = winningSideGameScore > losingSideGameScore;
  if (!winningSideIsHighGameValue) return { result: false, error: 'winningSide game score is not high' };

  const setTiebreakDefined = tiebreakAt && tiebreakFormat;
  const validTiebreakScores = sideTiebreakScores?.filter(s=>!isNaN(s)).length === 2;
  const winningSideTiebreakScore = sideTiebreakScores[winningSideIndex];
  const losingSideTiebreakScore = sideTiebreakScores[losingSideIndex];
  
  const hasTiebreakCondition = tiebreakAt && sideGameScores.filter(gameScore => gameScore >= tiebreakAt).length === 2;
  if (setTiebreakDefined) { 
    const { NoAD: tiebreakNoAD, tiebreakTo } = tiebreakFormat;

    if (hasTiebreakCondition) {
      if (gamesDifference > 1) {
        return { result: false, error: 'invalid winning game score (5)' };
      }
      if (!validTiebreakScores) {
        return { result: false, error: 'invalid tiebreak scores (1)' };
      }

      if (isNaN(tiebreakTo)) {
        return { result: false, error: 'tiebreakTo error' }; // TODO: test this
      }

      const meetsTiebreakTo = !!(tiebreakTo && sideTiebreakScores?.find(tiebreakScore => tiebreakScore >= tiebreakTo));
      if (!meetsTiebreakTo) {
        return { result: false, error: 'invalid tiebreak scores (2)' };
      }

      const maxGameScore = tiebreakAt < setTo ? setTo : setTo + 1;
      if (winningSideGameScore > maxGameScore) {
        return { result: false, error: 'invalid winning game score (1)' };
      }

      const winningSideIsHighTiebreakValue = winningSideTiebreakScore > losingSideTiebreakScore;
      if (!winningSideIsHighTiebreakValue) {
        return { result: false, error: 'winningSide tiebreak value is not high' };
      }

      const minimumTiebreakWinMargin = tiebreakNoAD ? 1 : 2;
      const tiebreakDifference = winningSideTiebreakScore - losingSideTiebreakScore;
      const losingSideGameScoreAtTiebreakToThreshold = losingSideTiebreakScore >= tiebreakTo - 1;
      const invalidTiebreakScore = tiebreakDifference &&
        losingSideGameScoreAtTiebreakToThreshold &&
        (tiebreakDifference < minimumTiebreakWinMargin);

      if (invalidTiebreakScore) {
        return { result: false, error: 'invalid tiebreak scores (3)' };
      }
    }
    
    const hasTiebreakGameScore = winningSideGameScore > setTo;
    if (hasTiebreakGameScore && (!setTiebreakDefined || !hasTiebreakCondition)) {
      return { result: false, error: 'invalid winning game score (2)' };
    }
  }

  const minimumGamesWinMargin = NoAD ? 1 : 2;
  const losingSideGameScoreAtSetToThreshold = losingSideGameScore >= setTo - 1;
  const invalidWinningScore = gamesDifference &&
    losingSideGameScoreAtSetToThreshold &&
    (!hasTiebreakCondition && gamesDifference < minimumGamesWinMargin);
  
  if (invalidWinningScore) {
    return { result: false, error: 'invalid winning game score (3)' };
  }

  if (gamesDifference > minimumGamesWinMargin && winningSideGameScore > setTo) {
    return { result: false, error: 'invalid winning game score (4)' };
  }

  return { result: true };
}

function checkValidTiebreakSetOutcome({ setObject, setFormat, sideTiebreakScores }) {
  if (!setObject) {
    return { result: false, error: 'missing setObject' };
  }
  const expectTiebreakSet = !!setFormat?.tiebreakSet;
  const expectTimedSet = !!setFormat?.timed;
  if (!setFormat || !expectTiebreakSet || expectTimedSet) {
    return { result: false, error: 'not tiebreak set' };
  }
  
  const isValidWinningSide = [1, 2].includes(setObject?.winningSide);
  if (!setObject || !isValidWinningSide) return { result: false, error: 'invalid winningSide' };

  const { tiebreakSet } = setFormat || {};
  const { NoAD, tiebreakTo } = tiebreakSet || {};
  
  const validTiebreakScores = sideTiebreakScores?.filter(s=>!isNaN(s)).length === 2;
  if (!validTiebreakScores) {
    return { result: false, error: 'invalid tiebreak scores (1)' };
  }

  if (isNaN(tiebreakTo)) {
    return { result: false, error: 'tiebreakTo error' }; // TODO: test this
  }

  const meetsTiebreakTo = !!(sideTiebreakScores?.find(tiebreakScore => tiebreakScore >= tiebreakTo));
  if (!meetsTiebreakTo) {
    return { result: false, error: 'invalid tiebreak scores (2)' };
  }

  const winningSideIndex = setObject?.winningSide - 1;
  const losingSideIndex = 1 - winningSideIndex;
  const winningSideTiebreakScore = sideTiebreakScores[winningSideIndex];
  const losingSideTiebreakScore = sideTiebreakScores[losingSideIndex];

  const winningSideIsHighTiebreakValue = winningSideTiebreakScore > losingSideTiebreakScore;
  if (!winningSideIsHighTiebreakValue) {
    return { result: false, error: 'winningSide tiebreak value is not high' };
  }

  const minimumTiebreakWinMargin = NoAD ? 1 : 2;
  const tiebreakDifference = winningSideTiebreakScore - losingSideTiebreakScore;
  const losingSideGameScoreAtTiebreakToThreshold = losingSideTiebreakScore >= tiebreakTo - 1;
  const invalidTiebreakScore = tiebreakDifference &&
    losingSideGameScoreAtTiebreakToThreshold &&
    (tiebreakDifference < minimumTiebreakWinMargin);

  if (invalidTiebreakScore) {
    return { result: false, error: 'invalid tiebreak scores (3)' };
  }

  return { result: true };
}
