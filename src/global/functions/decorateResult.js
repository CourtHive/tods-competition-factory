export function decorateResult({ result, stack, context }) {
  if (stack && result.error) {
    if (!result.error.stack) result.error.stack = [];
    result.error.stack.push(stack);
  }
  if (typeof context === 'object') {
    result = Object.assign(result, context);
  }

  return result;
}
