export function decorateResult({ result, stack, context, info }) {
  if (stack && result.error) {
    if (!result.error.stack) result.error.stack = [];
    result.error.stack.push(stack);
  }
  if (info && result.error) {
    result.error.info = info;
  }
  if (typeof context === 'object' && Object.keys(context).length) {
    result = Object.assign(result, context);
  }

  return result;
}
