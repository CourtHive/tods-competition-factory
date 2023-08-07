import { definedAttributes } from '../../utilities';

import { SUCCESS } from '../../constants/resultConstants';

type errorType = {
  message: string;
  info?: string;
  code: string;
};

type resultType = {
  [key: string]: any;
  result?: resultType;
  context?: object;
  error?: errorType;
  success?: boolean;
  stack?: string | string[];
  info?: string;
};

export function decorateResult({ result, stack, context, info }: resultType) {
  if (result && !Array.isArray(result?.stack)) result.stack = [];
  if (result && Array.isArray(result?.stack) && typeof stack === 'string') {
    result.stack.push(stack);
  }
  if (info && result?.error) result.error.info = info;
  if (result && typeof context === 'object' && Object.keys(context).length) {
    Object.assign(result, definedAttributes(context));
  }

  if (result && !result?.error && !result?.success) {
    Object.assign(result, { ...SUCCESS });
  }

  return result ?? { success: true };
}
