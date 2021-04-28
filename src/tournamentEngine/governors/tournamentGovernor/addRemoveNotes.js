import {
  INVALID_VALUES,
  MISSING_VALUE,
} from '../../../constants/errorConditionConstants';
import { SUCCESS } from '../../../constants/resultConstants';

export function addNotes({ element, notes }) {
  if (!element) return { error: MISSING_VALUE };
  if (!notes) return { error: MISSING_VALUE };
  if (typeof notes !== 'string') return { error: INVALID_VALUES };

  Object.assign(element, { notes });

  return SUCCESS;
}

export function removeNotes({ element }) {
  if (!element) return { error: MISSING_VALUE };

  if (element.notes) delete element.notes;

  return SUCCESS;
}
