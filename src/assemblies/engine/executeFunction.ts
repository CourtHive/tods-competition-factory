import { engineLogging } from '../../global/functions/producers/engineLogging';

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
  const result = method({
    tournamentRecords,
    ...params,
  });
  const elapsed = Date.now() - start;
  engineLogging({ result, methodName, elapsed, params, engine: 'ce:' });

  return result;
}
