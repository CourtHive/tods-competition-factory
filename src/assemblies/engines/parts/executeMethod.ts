import { engineLogging } from '../../../global/functions/producers/engineLogging';
import { paramsMiddleware } from './paramsMiddleware';
import {
  getDevContext,
  getTournamentId,
  getTournamentRecord,
  getTournamentRecords,
  handleCaughtError,
} from '../../../global/state/globalState';

import { FactoryEngine } from '../../../types/factoryTypes';

/**
 * Executes a function within a FactoryEngine.
 *
 * @param engine - The FactoryEngine object.
 * @param method - The function to be executed.
 * @param params - The parameters to be passed to the function.
 * @param methodName - The name of the method being executed.
 * @param engineType - The type of the engine.
 * @returns The result of the function execution.
 */

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
  const tournamentId = getTournamentId();
  const tournamentRecord =
    params?.sandboxTournament ?? getTournamentRecord(tournamentId);
  if (params) params.activeTournamentId = tournamentId;

  const augmentedParams = params
    ? paramsMiddleware(tournamentRecords, params)
    : undefined;
  if (augmentedParams?.error) return augmentedParams;

  const result = invoke({
    params: augmentedParams,
    tournamentRecords,
    tournamentRecord,
    methodName,
    method,
  });
  const elapsed = Date.now() - start;
  engineLogging({ result, methodName, elapsed, params, engineType });

  return result;
}

function invoke({
  tournamentRecords,
  tournamentRecord,
  params,
  methodName,
  method,
}) {
  if (getDevContext()) {
    return method({ tournamentRecords, tournamentRecord, ...params });
  } else {
    try {
      return method({ tournamentRecords, tournamentRecord, ...params });
    } catch (err) {
      return handleCaughtError({
        engineName: 'engine',
        methodName,
        params,
        err,
      });
    }
  }
}
