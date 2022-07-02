import { analyzeScore } from '../../matchUpEngine/governors/scoreGovernor/analyzeScore';
import { isConvertableInteger } from '../../utilities/math';
import { unique } from '../../utilities';

import {
  INVALID_VALUES,
  INVALID_WINNING_SIDE,
} from '../../constants/errorConditionConstants';

export function validateScore({
  existingMatchUpStatus,
  matchUpFormat,
  matchUpStatus,
  winningSide,
  score,
}) {
  if (typeof score !== 'object') return { error: INVALID_VALUES };
  const { sets, scoreStringSide1, scoreStringSide2 } = score;

  if (scoreStringSide1 !== undefined && typeof scoreStringSide1 !== 'string')
    return { error: INVALID_VALUES, info: 'scoreString must be a string!' };

  if (scoreStringSide2 !== undefined && typeof scoreStringSide2 !== 'string')
    return { error: INVALID_VALUES, info: 'scoreString must be a string!' };

  if (sets !== undefined && !Array.isArray(sets))
    return { error: INVALID_VALUES, info: 'sets must be an array' };

  if (sets?.length) {
    const setNumbers = sets.map((set) => set?.setNumber).filter(Boolean);
    if (setNumbers.length !== unique(setNumbers).length)
      return { error: INVALID_VALUES, info: 'setNumbers not unique' };

    for (const set of sets) {
      const {
        side1Score,
        side2Score,
        side1TiebreakScore,
        side2TiebreakScore,
        side1PointScore,
        side2PointScore,
        winningSide,
        setNumber,
      } = set;

      // ensure that if one side has a numeric value then both sides should have a numeric value
      const numericValuePairs = [
        [side1Score, side2Score],
        [side1TiebreakScore, side2TiebreakScore],
        [side1PointScore, side2PointScore],
      ]
        .filter((pair) => pair.some((value) => value !== undefined))
        .every((pair) =>
          pair.every((numericValue) => isConvertableInteger(numericValue))
        );

      if (!numericValuePairs) {
        return { error: INVALID_VALUES, info: 'non-numeric values' };
      }

      const numericValues = [setNumber, winningSide]
        .filter((value) => value !== undefined)
        .every((numericValue) => isConvertableInteger(numericValue));

      if (!numericValues) {
        return { error: INVALID_VALUES, info: 'non-numeric values' };
      }

      if (winningSide && ![1, 2].includes(winningSide))
        return { error: INVALID_VALUES, info: 'winningSide must be 1 or 2' };
    }
    const isValidScore = analyzeScore({
      existingMatchUpStatus,
      matchUpStatus,
      matchUpFormat,
      winningSide,
      score,
    });
    if (!isValidScore) {
      return {
        error: INVALID_WINNING_SIDE,
        info: 'winningSide does not match analyzed score',
      };
    }
  }

  return { valid: true };
}
