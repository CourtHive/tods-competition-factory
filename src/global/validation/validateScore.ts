import { analyzeScore } from '../../matchUpEngine/getters/analyzeScore';
import { mustBeAnArray } from '../../utilities/mustBeAnArray';
import { isConvertableInteger } from '../../utilities/math';
import { unique } from '../../utilities';

import {
  INVALID_SCORE,
  INVALID_VALUES,
} from '../../constants/errorConditionConstants';

import type { Score } from '../../types/tournamentFromSchema';

type validateScoreTypes = {
  existingMatchUpStatus: string;
  matchUpFormat: string;
  matchUpStatus: string;
  winningSide: number;
  score: Score;
};

export function validateScore({
  existingMatchUpStatus,
  matchUpFormat,
  matchUpStatus,
  winningSide,
  score,
}: validateScoreTypes) {
  if (typeof score !== 'object') return { error: INVALID_VALUES };
  const { sets, scoreStringSide1, scoreStringSide2 } = score;
  const info = 'scoreString must be a string!';

  if (scoreStringSide1 !== undefined && typeof scoreStringSide1 !== 'string')
    return { error: INVALID_VALUES, info };

  if (scoreStringSide2 !== undefined && typeof scoreStringSide2 !== 'string')
    return { error: INVALID_VALUES, info };

  if (sets !== undefined && !Array.isArray(sets))
    return { error: INVALID_VALUES, info: mustBeAnArray('sets') };

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

    const { valid: isValidScore } = analyzeScore({
      existingMatchUpStatus,
      matchUpStatus,
      matchUpFormat,
      winningSide,
      score,
    });

    if (!isValidScore) {
      return {
        error: INVALID_SCORE,
        info: 'score is invalid for matchUpFormat or winningSide does not match calculated winningSide',
      };
    }
  }

  return { valid: true };
}
