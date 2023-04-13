import { isValidExtension } from '../../validation/isValidExtension';

import { SUCCESS } from '../../../constants/resultConstants';
import {
  INVALID_VALUES,
  MISSING_VALUE,
} from '../../../constants/errorConditionConstants';

export function addExtension({ element, extension, creationTime = true } = {}) {
  if (!element) return { error: MISSING_VALUE };
  if (typeof element !== 'object') return { error: INVALID_VALUES };
  if (!isValidExtension({ extension }))
    return { error: INVALID_VALUES, info: 'invalid extension' };

  if (!element.extensions) element.extensions = [];

  if (creationTime) {
    const createdAt = new Date().toISOString();
    Object.assign(extension, { createdAt });
  }

  const existingExtension = element.extensions.find(
    ({ name }) => name === extension.name
  );
  if (existingExtension) {
    existingExtension.value = extension.value;
  } else if (extension.value) {
    element.extensions.push(extension);
  }

  return { ...SUCCESS };
}
