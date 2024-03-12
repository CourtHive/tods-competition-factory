import { isObject, isString } from '@Tools/objects';

// constants
import { INVALID_VALUES, MISSING_VALUE } from '@Constants/errorConditionConstants';
import { SUCCESS } from '@Constants/resultConstants';

export function addNotes(params?) {
  if (!isObject(params) || !params.notes) return { error: MISSING_VALUE };
  if (!isObject(params.element)) return { error: INVALID_VALUES };
  if (!isString(params.notes) && !params.notes?.testing) return { error: INVALID_VALUES };
  Object.assign(params.element, { notes: params.notes });

  return { ...SUCCESS };
}

export function removeNotes(params?) {
  if (!isObject(params)) return { error: MISSING_VALUE };
  if (!isObject(params.element)) return { error: INVALID_VALUES };
  if (params.element.notes) delete params.element.notes;

  return { ...SUCCESS };
}
