import { engineLogging } from '../../global/functions/producers/engineLogging';
import { handleCaughtError } from '../../global/state/syncGlobalState';
import { getDevContext } from '../../global/state/globalState';

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
  const result = invoke({
    tournamentRecords,
    methodName,
    method,
    ...params,
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
