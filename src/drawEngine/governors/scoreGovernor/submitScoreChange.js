import { matchUpFormatCode } from 'tods-matchup-format-code';
import {
  MISSING_MATCHUP,
  MISSING_SET_NUMBER,
  MISSING_SIDE_NUMBER,
  INVALID_SIDE_NUMBER,
  MISSING_VALUE,
  INVALID_SET_NUMBER,
} from '../../../constants/errorConditionConstants';
import { analyzeMatchUp } from './analyzeMatchUp';
import { analyzeSet } from './analyzeSet';

export function submitScoreChange(props) {
  const { matchUp, sideNumber, setNumber, value } = props || {};

  if (!matchUp) {
    return { result: false, error: MISSING_MATCHUP };
  }
  if (!sideNumber) {
    return { result: false, error: MISSING_SIDE_NUMBER };
  }
  if (!setNumber) {
    return { result: false, error: MISSING_SET_NUMBER };
  }
  if (!value) {
    return { result: false, error: MISSING_VALUE };
  }

  const analysis = analyzeMatchUp(props);

  if (!analysis.isValidSideNumber)
    return { result: false, error: INVALID_SIDE_NUMBER };

  const { modifiedSet, isValidSet, winnerChanged } = getModifiedSet(props);
  if (!isValidSet) return { result: false, error: INVALID_SET_NUMBER };

  if (winnerChanged) {
    if (!analysis.isLastSetWithValues) {
      console.log('is NOT last set with values');
      console.log('winner changed: all subsequent sets must be removed');
    } else {
      console.log('valid set modification', { modifiedSet });
    }
  }

  return { result: true };
}

function getModifiedSet(props) {
  const {
    matchUp,
    sideNumber,
    setNumber,
    isTiebreakValue,
    isGameValue,
    value,
  } = props || {};
  let { matchUpFormat } = props || {};
  const analysis = analyzeMatchUp(props);

  const setObject = matchUp?.sets.find((set) => set.setNumber === setNumber);
  const modifiedSet = Object.assign({}, setObject || { setNumber });

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
    // console.log('game scores', { sideNumber, value });
    if (sideNumber === 1) {
      modifiedSet.side1Score = value;
    } else if (sideNumber === 2) {
      modifiedSet.side2Score = value;
    }
  }

  matchUpFormat = matchUpFormat || matchUp?.matchUpFormat;
  const matchUpScoringFormat = matchUpFormatCode?.parse(matchUpFormat);
  let modifiedSetAnalysis = analyzeSet({
    setObject: modifiedSet,
    matchUpScoringFormat,
  });

  modifiedSet.winningSide = modifiedSetAnalysis.winningSide;

  const { isValidSet } = modifiedSetAnalysis;
  if (!isValidSet) {
    // check modifications which might make it a valid set
    const { hasTiebreakCondition, sideTiebreakScoresCount } =
      modifiedSetAnalysis;

    if (hasTiebreakCondition && sideTiebreakScoresCount) {
      modifiedSet.side1TiebreakScore = undefined;
      modifiedSet.side2TiebreakScore = undefined;
      modifiedSet.winningSide = false;

      const attemptedModificationAnalysis = analyzeSet({
        setObject: modifiedSet,
        matchUpScoringFormat,
      });

      if (attemptedModificationAnalysis.isValidSet) {
        modifiedSet.winningSide = attemptedModificationAnalysis.winningSide;
        const winnerChanged =
          setObject?.winningSide !== modifiedSet.winningSide;
        modifiedSetAnalysis = attemptedModificationAnalysis;
        return {
          modifiedSet,
          isValidSet: true,
          winnerChanged,
          modifiedSetAnalysis,
        };
      }
    }
  }

  const winnerChanged = setObject?.winningSide !== modifiedSet.winningSide;

  return { modifiedSet, isValidSet, winnerChanged, modifiedSetAnalysis };
}
