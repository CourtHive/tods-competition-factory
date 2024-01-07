import { recordStorage } from '../../../data/fileSystem';
import { mutationEngine } from '../engines/mutationEngine';
import { Logger } from '@nestjs/common';

export async function executionQueue(payload: any) {
  const { executionQueue = [] } = payload ?? {};
  const tournamentIds = payload?.tournamentIds || (payload?.tournamentId && [payload.tournamentId]) || [];

  if (!tournamentIds.length) {
    Logger.error('No tournamentRecord provided');
    return { error: 'No tournamentIds provided' };
  }

  const tournamentRecords = await recordStorage.fetchTournamentRecords(tournamentIds);
  mutationEngine.setState(tournamentRecords);
  const mutationResult = await mutationEngine.executionQueue(executionQueue);

  if (mutationResult.success) {
    const mutatedTournamentRecords: any[] = mutationEngine.getState().tournamentRecords;
    const updateResult = await recordStorage.saveTournamentRecords({
      tournamentRecords: mutatedTournamentRecords
    });
    if (!updateResult.success) {
      return { error: 'Coult not persist tournament record(s)' };
    }
  }

  return mutationResult;
}
