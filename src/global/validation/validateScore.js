import { analyzeScore } from '../../drawEngine/governors/scoreGovernor/analyzeScore';
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
    return { error: INVALID_VALUES, message: 'scoreString must be a string!' };

  if (scoreStringSide2 !== undefined && typeof scoreStringSide2 !== 'string')
    return { error: INVALID_VALUES, message: 'scoreString must be a string!' };

  if (sets !== undefined && !Array.isArray(sets))
    return { error: INVALID_VALUES, message: 'sets must be an array' };

  if (sets?.length) {
    const setNumbers = sets.map((set) => set?.setNumber).filter(Boolean);
    if (setNumbers.length !== unique(setNumbers).length)
      return { error: INVALID_VALUES, message: 'setNumbers not unique' };

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

      const numericValues = [
        side1Score,
        side2Score,
        side1TiebreakScore,
        side2TiebreakScore,
        side1PointScore,
        side2PointScore,
        setNumber,
        winningSide,
      ]
        .filter((value) => value !== undefined)
        .every((numericValue) => isConvertableInteger(numericValue));

      if (!numericValues) {
        return { error: INVALID_VALUES, message: 'non-numeric values' };
      }

      if (winningSide && ![1, 2].includes(winningSide))
        return { error: INVALID_VALUES, message: 'winningSide must be 1 or 2' };
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
        message: 'winningSide does not match analyzed score',
      };
    }
  }

  return { valid: true };
}
