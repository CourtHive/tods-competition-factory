import { engineLogging } from '../../global/functions/producers/engineLogging';
import { handleCaughtError } from '../../global/state/syncGlobalState';
import { getDevContext } from '../../global/state/globalState';
import { paramsMiddleware } from './paramsMiddleware';

export function executeFunction(
  engine,
  tournamentRecords,
  method,
  params,
  methodName
) {
  delete engine.success;
  delete engine.error;

  const start = Date.now();
  const augmentedParams = paramsMiddleware(tournamentRecords, params);
  const result = invoke({
    params: augmentedParams,
    tournamentRecords,
    methodName,
    method,
  });
  const elapsed = Date.now() - start;
  engineLogging({ result, methodName, elapsed, params, engine: 'ce:' });

  return result;
}

function invoke({ method, tournamentRecords, params, methodName }) {
  if (getDevContext()) {
    return method({ tournamentRecords, ...params });
  } else {
    try {
      return method({ tournamentRecords, ...params });
    } catch (err) {
      handleCaughtError({
        engineName: 'engine',
        methodName,
        params,
        err,
      });
    }
  }
}
