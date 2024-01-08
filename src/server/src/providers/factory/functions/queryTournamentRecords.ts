import { queryEngine } from '../engines/queryEngine';
import recordStorage from '../../../data/fileSystem';
import { Logger } from '@nestjs/common';

export async function queryTournamentRecords(payload) {
  const tournamentIds = payload?.tournamentIds || (payload?.tournamentId && [payload.tournamentId]) || [];

  if (!tournamentIds.length) {
    Logger.error('No tournamentRecord provided');
    return { error: 'No tournamentIds provided' };
  }

  const tournamentRecords = await recordStorage.fetchTournamentRecords(tournamentIds);
  queryEngine.setState(tournamentRecords);

  const { method, params } = payload;
  return queryEngine[method](params);
}
