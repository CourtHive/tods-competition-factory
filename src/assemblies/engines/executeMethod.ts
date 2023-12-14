import { engineLogging } from '../../global/functions/producers/engineLogging';
import { handleCaughtError } from '../../global/state/syncGlobalState';
import { paramsMiddleware } from './paramsMiddleware';
import {
  getDevContext,
  getTournamentRecords,
} from '../../global/state/globalState';

import { FactoryEngine } from '../../types/factoryTypes';

export function executeFunction(
  engine: FactoryEngine,
  method: any,
  params: { [key: string]: any } | undefined,
  methodName: string,
  engineType: string
) {
  delete engine.success;
  delete engine.error;

  const start = Date.now();
  const tournamentRecords = getTournamentRecords();
  const augmentedParams = params
    ? paramsMiddleware(tournamentRecords, params)
    : undefined;
  const result = invoke({
    params: augmentedParams,
    tournamentRecords,
    methodName,
    method,
  });
  const elapsed = Date.now() - start;
  engineLogging({ result, methodName, elapsed, params, engineType });

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
