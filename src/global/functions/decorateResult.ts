import { definedAttributes } from '../../utilities';

import { ErrorType } from '../../constants/errorConditionConstants';
import { SUCCESS } from '../../constants/resultConstants';

export type ResultType = {
  context?: { [key: string]: any };
  stack?: string | string[];
  error?: ErrorType;
  errors?: string[];
  success?: boolean;
  valid?: boolean;
  info?: any;
};

type DecorateResultArgs = {
  context?: { [key: string]: any };
  stack?: string | string[];
  result: any;
  info?: any;
};

export function decorateResult({
  context,
  result,
  stack,
  info,
}: DecorateResultArgs): ResultType {
  if (result && !Array.isArray(result?.stack)) result.stack = [];
  if (result && Array.isArray(result?.stack) && typeof stack === 'string') {
    result.stack.push(stack);
  }
  if (info) {
    if (result?.error) {
      result.error.info = info;
    } else {
      result.info = info;
    }
  }
  if (result && typeof context === 'object' && Object.keys(context).length) {
    Object.assign(result, definedAttributes(context));
  }

  if (result && !result?.error && !result?.success) {
    Object.assign(result, { ...SUCCESS });
  }

  return result ?? { success: true };
}
