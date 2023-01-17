import { definedAttributes } from '../../utilities';

import { SUCCESS } from '../../constants/resultConstants';

export function decorateResult({ result, stack, context, info }) {
  if (!Array.isArray(result.stack)) {
    result.stack = [];
  }
  if (stack) {
    result.stack.push(stack);
  }
  if (info && result.error) {
    result.error.info = info;
  }
  if (typeof context === 'object' && Object.keys(context).length) {
    Object.assign(result, definedAttributes(context));
  }

  if (!result.error && !result.success) {
    Object.assign(result, { ...SUCCESS });
  }

  return result;
}
