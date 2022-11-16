import { definedAttributes } from '../../utilities';

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
    result = Object.assign(result, definedAttributes(context));
  }

  return result;
}
