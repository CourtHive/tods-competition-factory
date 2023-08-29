import { isValidExtension } from '../../validation/isValidExtension';
import { decorateResult } from '../decorateResult';

import { SUCCESS } from '../../../constants/resultConstants';
import {
  ErrorType,
  INVALID_VALUES,
  MISSING_VALUE,
} from '../../../constants/errorConditionConstants';

import { Extension } from '../../../types/tournamentFromSchema';

type AddExtensionArgs = {
  creationTime?: boolean;
  extension: Extension;
  element: any;
};

export function addExtension(params?: AddExtensionArgs): {
  success?: boolean;
  error?: ErrorType;
} {
  if (typeof params !== 'object') return { error: MISSING_VALUE };
  const stack = 'addExtension';
  if (!params?.element)
    return decorateResult({ result: { error: MISSING_VALUE }, stack });

  if (typeof params.element !== 'object')
    return decorateResult({ result: { error: INVALID_VALUES }, stack });

  if (!isValidExtension({ extension: params.extension }))
    return decorateResult({
      result: { error: INVALID_VALUES, info: 'invalid extension' },
      stack,
    });

  if (!params.element.extensions) params.element.extensions = [];

  const creationTime =
    params.creationTime !== undefined ? params.creationTime : true;

  if (creationTime) {
    const createdAt = new Date().toISOString();
    Object.assign(params.extension, { createdAt });
  }

  const existingExtension = params.element.extensions.find(
    ({ name }) => name === params.extension.name
  );
  if (existingExtension) {
    existingExtension.value = params.extension.value;
  } else if (params.extension.value) {
    params.element.extensions.push(params.extension);
  }

  return { ...SUCCESS };
}
