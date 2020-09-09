import { analyzeSet } from './analyzeSet';

// import { matchUpFormatCode } from 'tods-matchup-format-code';
let { matchUpFormatCode } = require('tods-matchup-format-code');

// TODO: what about checking array of sets are in order? ( setNumber )
interface MatchAnalysisInterface {
  matchUp: any;
  sideNumber: number;
  setNumber: number;
  isTiebreakValue: boolean;
  isPointValue: boolean;
  matchUpFormat: any;
}

export function analyzeMatchUp(props: MatchAnalysisInterface) {
  const { matchUp, sideNumber, setNumber, isTiebreakValue, isPointValue } = props || {};
  let { matchUpFormat } = props || {};

  matchUpFormat = matchUpFormat || matchUp?.matchUpFormat;
  const matchUpScoringFormat = matchUpFormatCode?.parse(matchUpFormat);
  const isCompletedMatchUp = !!matchUp?.winningSide;

  const setsCount = matchUp?.sets?.length;
  const setIndex = setNumber && setNumber - 1;
  const isExistingSet = !!matchUp?.sets?.find((set: any, index: number) => set.setNumber === setNumber && index === setIndex);
  const completedSets = matchUp?.sets?.filter((set: any) => set?.winningSide) || [];
  const completedSetsCount = completedSets?.length || 0;
  const setsFollowingCurrent = (setNumber && matchUp?.sets?.slice(setNumber)) || [];
  const isLastSetWithValues = !!(setsCount && setNumber && setsFollowingCurrent?.reduce((noValues: boolean, set: any) => {
    return (
      !set ||
      (
        !set.side1Score &&
        !set.side2Score &&
        !set.side1TiebreakScore &&
        !set.side2TiebreakScore &&
        !set.side1PointScore &&
        !set.side2PointScore
      ))
      && noValues;
  }, true));

  const setObject = setNumber <= setsCount && matchUp?.sets.find((set: any) => set.setNumber === setNumber);
  const specifiedSetAnalysis = analyzeSet({ setObject, matchUpScoringFormat });
  const {
    isCompletedSet,
    sideGameScores,
    // sidePointScores,
    sideTiebreakScores,
  } = specifiedSetAnalysis;
  const isActiveSet = !!((setObject && !isCompletedSet && isLastSetWithValues) ||
    (setNumber && setNumber === setsCount + 1 && !isCompletedMatchUp));

  const isValidSideNumber = [1, 2].includes(sideNumber);
  const sideIndex = isValidSideNumber && sideNumber - 1;
  
  const existingValue = setObject && isValidSideNumber && (
    (!isTiebreakValue && !isPointValue && sideGameScores[sideIndex] !== undefined && sideGameScores[sideIndex]) ||
    (isTiebreakValue && sideTiebreakScores[sideIndex] !== undefined && sideTiebreakScores[sideIndex])
  )
  const hasExistingValue = !!existingValue;

  const completedSetsHaveValidOutcomes = completedSets &&
    completedSets.map((setObject: any) => analyzeSet({ setObject, matchUpScoringFormat}).isValidSetOutcome)
    .reduce((valid: boolean, validOutcome: boolean) => valid && validOutcome, true);

  const setsWinCounts = completedSets.reduce((counts: number[], set: any) => {
    const { winningSide } = set;
    const winningSideIndex = winningSide - 1;
    counts[winningSideIndex]++;
    return counts;
  }, [0, 0]);

  const matchUpWinningSide = matchUp?.winningSide;
  const matchUpWinningSideIndex = matchUpWinningSide && matchUpWinningSide - 1;
  const matchUpLosingSideIndex = 1 - matchUpWinningSideIndex;
  const winningSideSetsCount = setsWinCounts[matchUpWinningSideIndex];
  const losingSideSetsCount = setsWinCounts[matchUpLosingSideIndex];

  const maxSetsCount = Math.max(...setsWinCounts);
  const calculatedWinningSide = setsWinCounts.indexOf(maxSetsCount) + 1;
  const validMatchUpWinningSide = winningSideSetsCount > losingSideSetsCount && matchUpWinningSide === calculatedWinningSide;
  const validMatchUpOutcome = completedSetsHaveValidOutcomes && validMatchUpWinningSide;

  return {
    isValidSideNumber,
    matchUpScoringFormat,
    hasExistingValue, existingValue,
    validMatchUpWinningSide, validMatchUpOutcome,
    isExistingSet, isActiveSet, isLastSetWithValues,
    isCompletedMatchUp, completedSetsCount, completedSetsHaveValidOutcomes,
    ...specifiedSetAnalysis,
  };
}
