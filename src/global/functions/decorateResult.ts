import { definedAttributes } from '../../utilities';

import { ErrorType } from '../../constants/errorConditionConstants';
import { SUCCESS } from '../../constants/resultConstants';

export type ResultType = {
  stack?: string | string[];
  result?: ResultType;
  [key: string]: any;
  error?: ErrorType;
  errors?: string[];
  success?: boolean;
  valid?: boolean;
  context?: any;
  info?: any;
};

export function decorateResult({
  context,
  result,
  stack,
  info,
}: ResultType): ResultType {
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
