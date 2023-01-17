import { SUCCESS } from '../../../constants/resultConstants';
import {
  INVALID_VALUES,
  MISSING_VALUE,
} from '../../../constants/errorConditionConstants';

export function addNotes({ element, notes } = {}) {
  if (typeof element !== 'object') return { error: INVALID_VALUES };
  if (!notes) return { error: MISSING_VALUE };

  if (typeof notes !== 'string' && !notes?.testing)
    return { error: INVALID_VALUES };

  Object.assign(element, { notes });

  return { ...SUCCESS };
}

export function removeNotes({ element } = {}) {
  if (typeof element !== 'object') return { error: INVALID_VALUES };

  if (element.notes) delete element.notes;

  return { ...SUCCESS };
}
