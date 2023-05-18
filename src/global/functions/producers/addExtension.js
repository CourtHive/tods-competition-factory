import { isValidExtension } from '../../validation/isValidExtension';
import { decorateResult } from '../decorateResult';

import { SUCCESS } from '../../../constants/resultConstants';
import {
  INVALID_VALUES,
  MISSING_VALUE,
} from '../../../constants/errorConditionConstants';

export function addExtension({ element, extension, creationTime = true } = {}) {
  const stack = 'addExtension';
  if (!element)
    return decorateResult({ result: { error: MISSING_VALUE }, stack });
  if (typeof element !== 'object')
    return decorateResult({ result: { error: INVALID_VALUES }, stack });
  if (!isValidExtension({ extension }))
    return decorateResult({
      result: { error: INVALID_VALUES, info: 'invalid extension' },
      stack,
    });

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
