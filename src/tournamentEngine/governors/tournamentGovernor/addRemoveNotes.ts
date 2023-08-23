import { SUCCESS } from '../../../constants/resultConstants';
import {
  INVALID_VALUES,
  MISSING_VALUE,
} from '../../../constants/errorConditionConstants';

export function addNotes(params) {
  if (typeof params !== 'object') return { error: MISSING_VALUE };
  if (typeof params.element !== 'object') return { error: INVALID_VALUES };
  if (!params.notes) return { error: MISSING_VALUE };

  if (typeof params.notes !== 'string' && !params.notes?.testing)
    return { error: INVALID_VALUES };

  Object.assign(params.element, { notes: params.notes });

  return { ...SUCCESS };
}

export function removeNotes(params) {
  if (typeof params !== 'object') return { error: MISSING_VALUE };
  if (typeof params.element !== 'object') return { error: INVALID_VALUES };

  if (params.element.notes) delete params.element.notes;

  return { ...SUCCESS };
}
