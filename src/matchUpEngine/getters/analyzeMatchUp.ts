import { parse } from '../governors/matchUpFormatGovernor/parse';
import { instanceCount } from '../../utilities/arrays';
import { analyzeSet } from './analyzeSet';

import { MISSING_MATCHUP } from '../../constants/errorConditionConstants';

// TODO: what about checking array of sets are in order? ( setNumber )

export function analyzeMatchUp(params?) {
  const { matchUp, sideNumber, setNumber, isTiebreakValue, isPointValue } =
    params || {};
  let { matchUpFormat } = params || {};
  if (!matchUp) return { error: MISSING_MATCHUP };

  matchUpFormat = matchUpFormat || matchUp?.matchUpFormat;
  const matchUpScoringFormat = parse(matchUpFormat);
  const isCompletedMatchUp = !!matchUp?.winningSide;

  const sets = matchUp.score?.sets;
  const setsCount = sets?.length;
  const setIndex = setNumber && setNumber - 1;
  const isExistingSet = !!sets?.find(
    (set, index) => set.setNumber === setNumber && index === setIndex
  );
  const completedSets = sets?.filter((set) => set?.winningSide) || [];
  const completedSetsCount = completedSets?.length || 0;
  const setsFollowingCurrent = (setNumber && sets?.slice(setNumber)) || [];
  const isLastSetWithValues = !!(
    setsCount &&
    setNumber &&
    // EVERY: is this a candidate for .every?
    setsFollowingCurrent?.reduce((noValues, set) => {
      return (
        (!set ||
          (!set.side1Score &&
            !set.side2Score &&
            !set.side1TiebreakScore &&
            !set.side2TiebreakScore &&
            !set.side1PointScore &&
            !set.side2PointScore)) &&
        noValues
      );
    }, true)
  );

  const setObject =
    setNumber <= setsCount && sets.find((set) => set.setNumber === setNumber);
  const specifiedSetAnalysis =
    setObject && analyzeSet({ setObject, matchUpScoringFormat });

  const {
    isCompletedSet,
    sideGameScores,
    // sidePointScores,
    sideTiebreakScores,
  } = specifiedSetAnalysis || {};
  const isActiveSet = !!(
    (setObject && !isCompletedSet && isLastSetWithValues) ||
    (setNumber && setNumber === setsCount + 1 && !isCompletedMatchUp)
  );

  const isValidSideNumber = [1, 2].includes(sideNumber);
  const sideIndex = isValidSideNumber ? sideNumber - 1 : 0;

  const existingValue =
    setObject &&
    isValidSideNumber &&
    ((!isTiebreakValue &&
      !isPointValue &&
      sideGameScores[sideIndex] !== undefined &&
      sideGameScores[sideIndex]) ||
      (isTiebreakValue &&
        sideTiebreakScores[sideIndex] !== undefined &&
        sideTiebreakScores[sideIndex]));
  const hasExistingValue = !!existingValue;

  const completedSetsHaveValidOutcomes = completedSets
    ?.map(
      (setObject) =>
        analyzeSet({ setObject, matchUpScoringFormat }).isValidSetOutcome
    )
    .reduce((valid, validOutcome) => valid && validOutcome, true);

  const setsWinCounts = completedSets.reduce(
    (counts, set) => {
      const { winningSide } = set;
      const winningSideIndex = winningSide - 1;
      counts[winningSideIndex]++;
      return counts;
    },
    [0, 0]
  );
  const matchUpWinningSide = matchUp?.winningSide;
  const matchUpWinningSideIndex = matchUpWinningSide && matchUpWinningSide - 1;
  const matchUpLosingSideIndex = 1 - matchUpWinningSideIndex;
  const winningSideSetsCount = setsWinCounts[matchUpWinningSideIndex];
  const losingSideSetsCount = setsWinCounts[matchUpLosingSideIndex];

  const maxSetsCount = Math.max(...setsWinCounts);
  const maxSetsInstances = instanceCount(setsWinCounts)[maxSetsCount];
  const { bestOf } = matchUpScoringFormat || {};
  const setsToWin = (bestOf && Math.ceil(bestOf / 2)) || 1;
  const calculatedWinningSide =
    (maxSetsCount === setsToWin &&
      maxSetsInstances === 1 &&
      setsWinCounts.indexOf(maxSetsCount) + 1) ||
    undefined;

  const validMatchUpWinningSide =
    winningSideSetsCount > losingSideSetsCount &&
    matchUpWinningSide === calculatedWinningSide;

  const validMatchUpOutcome =
    calculatedWinningSide &&
    completedSetsHaveValidOutcomes &&
    validMatchUpWinningSide;

  return {
    completedSetsHaveValidOutcomes,
    validMatchUpWinningSide,
    calculatedWinningSide,
    matchUpScoringFormat,
    validMatchUpOutcome,
    isLastSetWithValues,
    completedSetsCount,
    isCompletedMatchUp,
    isValidSideNumber,
    hasExistingValue,
    existingValue,
    isExistingSet,
    isActiveSet,
    ...specifiedSetAnalysis,
  };
}
