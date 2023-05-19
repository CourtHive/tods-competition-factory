import { decorateResult } from '../decorateResult';

import {
  MISSING_VALUE,
  NOT_FOUND,
} from '../../../constants/errorConditionConstants';

export function findExtension({ element, name }) {
  const stack = 'findExtension';
  if (!element || !name)
    return decorateResult({ result: { error: MISSING_VALUE }, stack });
  if (!Array.isArray(element.extensions))
    return decorateResult({ result: { error: NOT_FOUND }, stack });

  const extension = element.extensions.find(
    (extension) => extension?.name === name
  );
  if (!extension)
    return decorateResult({ result: { error: NOT_FOUND }, stack });

  return { extension };
}
