export function decorateResult({ result, callChain, context }) {
  if (result?.error) {
    if (typeof result.error === 'object') {
      if (callChain) {
        if (!result.error.callChain) result.error.callChain = [];
        result.error.callChain.push(callChain);
      }
      if (typeof context === 'object') {
        result.error = Object.assign(result.error, ...context);
      }
    }
    return result;
  }

  if (callChain) {
    if (!result.callChain) result.callChain = [];
    result.callChain.push(callChain);
  }
  if (typeof context === 'object') {
    result = Object.assign(result, ...context);
  }

  return result;
}
