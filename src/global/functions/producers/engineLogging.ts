import { ResultType } from '../decorateResult';
import {
  DevContextType,
  getDevContext,
  globalLog,
} from '../../state/globalState';

type EngineLoggingArgs = {
  params?: { [key: string]: any } | boolean;
  methodName: string;
  result: ResultType;
  elapsed: number;
  engine: string;
};

export function engineLogging({
  methodName,
  elapsed,
  engine,
  params,
  result,
}: EngineLoggingArgs) {
  const devContext: DevContextType = getDevContext();
  if (typeof devContext !== 'object') return;

  const log: any = { method: methodName };
  const logError =
    result?.error &&
    (devContext.errors === true ||
      (Array.isArray(devContext.errors) &&
        devContext.errors.includes(methodName)));

  const specifiedMethodParams =
    Array.isArray(devContext.params) && devContext.params?.includes(methodName);

  const logParams =
    (devContext.params && !Array.isArray(devContext.params)) ||
    specifiedMethodParams;

  const exclude =
    Array.isArray(devContext.exclude) &&
    devContext.exclude.includes(methodName);

  if (
    !exclude &&
    ![undefined, false].includes(devContext.perf) &&
    (isNaN(devContext.perf) || elapsed > devContext.perf)
  ) {
    log.elapsed = elapsed;
  }

  if (!exclude && (logError || logParams)) {
    log.params = params;
  }

  if (
    !exclude &&
    (logError ||
      (devContext.result &&
        !Array.isArray(devContext.result) &&
        (!Array.isArray(devContext.params) || specifiedMethodParams)) ||
      (Array.isArray(devContext.result) &&
        devContext.result?.includes(methodName)))
  ) {
    log.result = result;
  }

  if (Object.keys(log).length > 1) globalLog(engine, log);
}
