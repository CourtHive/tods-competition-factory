import { engineLogging } from '../../../global/state/engineLogging';

import { METHOD_NOT_FOUND } from '../../../constants/errorConditionConstants';
import { ResultType } from '../../../functions/global/decorateResult';

type LogMethodNotFoundArgs = {
  params?: { [key: string]: any };
  methodName: string;
  start?: number;
};

export function logMethodNotFound({ methodName, params, start }: LogMethodNotFoundArgs): ResultType {
  const result = { error: METHOD_NOT_FOUND, methodName };
  const elapsed = start ? Date.now() - start : 0;
  engineLogging({
    result,
    methodName,
    elapsed,
    params,
    engineType: 'sync',
  });
  return result;
}
