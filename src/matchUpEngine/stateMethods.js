import { makeDeepCopy } from '../utilities';
import {
  INVALID_OBJECT,
  MISSING_VALUE,
} from '../constants/errorConditionConstants';

// TASK: add verify/validate structure as option in setState
export function setState(score, deepCopyOption = true) {
  if (!score) return { error: MISSING_VALUE };
  if (typeof score !== 'object') return { error: INVALID_OBJECT };

  return deepCopyOption ? makeDeepCopy(score) : score;
}
