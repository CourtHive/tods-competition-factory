import { engineLogging } from '../../global/functions/producers/engineLogging';
import { handleCaughtError } from '../../global/state/syncGlobalState';
import { paramsMiddleware } from './paramsMiddleware';
import {
  getDevContext,
  getTournamentRecords,
} from '../../global/state/globalState';

export function executeFunction(engine, method, params, methodName) {
  delete engine.success;
  delete engine.error;

  const start = Date.now();
  const tournamentRecords = getTournamentRecords();
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

function invoke({ tournamentRecords, params, methodName, method }) {
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
