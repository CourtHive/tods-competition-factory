import { INVALID_VALUES } from '../../constants/errorConditionConstants';

export function validateScore({ score }) {
  if (typeof score !== 'object') return { error: INVALID_VALUES };
  return { valid: true };
}
