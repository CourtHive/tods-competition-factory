export function decorateResult({ result, callChain, context }) {
  if (callChain) {
    if (!result.callChain) result.callChain = [];
    result.callChain.push(callChain);
  }
  if (typeof context === 'object') {
    result = Object.assign(result, context);
  }

  return result;
}
