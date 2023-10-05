import { generateScoreString } from '../../generators/generateScoreString';
import { definedAttributes } from '../../../utilities';

import { SUCCESS } from '../../../constants/resultConstants';
import {
  ErrorType,
  MISSING_VALUE,
} from '../../../constants/errorConditionConstants';

export function reverseScore(params?): {
  reversedScore?: any;
  success?: boolean;
  error?: ErrorType;
} {
  if (!params?.score) return { error: MISSING_VALUE };
  const { sets } = params.score;
  const reversedSets = sets.map((set) => {
    const {
      side1TiebreakScore,
      side2TiebreakScore,
      winningSide,
      side1Score,
      side2Score,
      setNumber,
    } = set;
    return definedAttributes({
      winningSide: winningSide ? 3 - winningSide : undefined,
      side1TiebreakScore: side2TiebreakScore,
      side2TiebreakScore: side1TiebreakScore,
      side1Score: side2Score,
      side2Score: side1Score,
      setNumber,
    });
  });
  const scoreStringSide1 = generateScoreString({ sets: reversedSets });
  const scoreStringSide2 = generateScoreString({
    sets: reversedSets,
    reversed: true,
  });

  return {
    reversedScore: { sets: reversedSets, scoreStringSide1, scoreStringSide2 },
    ...SUCCESS,
  };
}
