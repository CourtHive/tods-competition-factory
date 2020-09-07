import { matchUpFormatCode } from 'tods-matchup-format-code';
import { analyzeMatchUp } from './analyzeMatchUp';
import { analyzeSet } from './analyzeSet';

export function submitScoreChange(props) {
  const { matchUp, sideNumber, setNumber, value} = props || {};

  if (!matchUp) { return { result: false, error: 'missing matchUp' }; }
  if (!sideNumber) { return { result: false, error: 'missing sideNumber' }; }
  if (!setNumber) { return { result: false, error: 'missing setNumber' }; }
  if (!value) { return { result: false, error: 'missing value' }; }

  const analysis = analyzeMatchUp(props);

  if (!analysis.isValidSideNumber) return { result: false, error: 'invalid side number' };

  const { modifiedSet, isValidSet, winnerChanged } = getModifiedSet(props);
  console.log({ analysis, modifiedSet, isValidSet });

  if (analysis.isLastSetWithValues) {
    console.log('is last set with values')

  } else {
    console.log('is NOT last set with values')
  }

  return { result: true };
}

function getModifiedSet(props) {
  const { matchUp, sideNumber, setNumber, isTiebreakValue, isGameValue, value} = props || {};
  let { matchUpFormat } = props || {};
  const analysis = analyzeMatchUp(props);

  let setObject = matchUp?.sets.find(set => set.setNumber === setNumber);
  let modifiedSet = Object.assign({}, setObject || { setNumber });

  if (isTiebreakValue) {
    if (!analysis.expectTimedSet) {
      if (sideNumber === 1) {
        modifiedSet.side1TiebreakScore = value;
      } else if (sideNumber === 2) {
        modifiedSet.side2TiebreakScore = value;
      }
    }
  } else if (isGameValue) {
    // TODO: check if value is valid point value
    if (sideNumber === 1) {
      modifiedSet.side1PointScore = value;
    } else if (sideNumber === 2) {
      modifiedSet.side2PointScore = value;
    }
  } else {
    console.log('game scores', { sideNumber, value })
    if (sideNumber === 1) {
      modifiedSet.side1Score = value;
    } else if (sideNumber === 2) {
      modifiedSet.side2Score = value;
    }
  }

  matchUpFormat = matchUpFormat || matchUp?.matchUpFormat;
  const matchUpScoringFormat = matchUpFormatCode?.parse(matchUpFormat);
  const modifiedSetAnalysis = analyzeSet({setObject: modifiedSet, matchUpScoringFormat});
  const { isValidSet } = modifiedSetAnalysis;

  // TODO: getWinner of set
  const winnerChanged = setObject?.winningSide !== modifiedSet.winningSide;

  return { modifiedSet, isValidSet, winnerChanged };
}
