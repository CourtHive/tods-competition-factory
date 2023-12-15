import { engineLogging } from '../../../global/functions/producers/engineLogging';

import { METHOD_NOT_FOUND } from '../../../constants/errorConditionConstants';
import { ResultType } from '../../../global/functions/decorateResult';

type LogMethodNotFoundArgs = {
  params?: { [key: string]: any };
  methodName: string;
  start?: number;
};

export function logMethodNotFound({
  methodName,
  params,
  start,
}: LogMethodNotFoundArgs): ResultType {
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
