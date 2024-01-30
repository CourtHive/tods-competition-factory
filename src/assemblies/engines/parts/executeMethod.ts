import { engineLogging } from '@Global/state/engineLogging';
import { paramsMiddleware } from './paramsMiddleware';
import { makeDeepCopy } from '@Tools/makeDeepCopy';
import {
  getDevContext,
  getTournamentId,
  getTournamentRecord,
  getTournamentRecords,
  handleCaughtError,
} from '@Global/state/globalState';

// types
import { FactoryEngine } from '@Types/factoryTypes';

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
  engineType: string,
) {
  delete engine.success;
  delete engine.error;

  const start = Date.now();
  const tournamentId = getTournamentId();
  if (params) params.activeTournamentId = tournamentId;

  const tournamentRecord = params?.tournamentRecord || getTournamentRecord(tournamentId);

  const tournamentRecords =
    (typeof params?.tournamentRecord === 'object' && {
      [params?.tournamentRecord.tournamentId]: params.tournamentRecord,
    }) ||
    getTournamentRecords();

  // ENSURE that logged params are not mutated by middleware
  const paramsToLog = params ? makeDeepCopy(params, undefined, true) : undefined;
  const augmentedParams = params ? paramsMiddleware(tournamentRecords, params) : undefined;
  if (augmentedParams?.error) return augmentedParams;

  const result = invoke({
    params: augmentedParams,
    tournamentRecords,
    tournamentRecord,
    methodName,
    method,
  });
  const elapsed = Date.now() - start;
  engineLogging({ result, methodName, elapsed, params: paramsToLog, engineType });

  return result;
}

function invoke({ tournamentRecords, tournamentRecord, params, methodName, method }) {
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
