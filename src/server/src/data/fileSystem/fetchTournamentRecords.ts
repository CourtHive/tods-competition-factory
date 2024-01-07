import { findTournamentRecord } from './findTournamentRecord';

export async function fetchTournamentRecords(tournamentIds: any) {
  const tournamentRecords: any[] = [];
  for (const tournamentId of tournamentIds) {
    const result = await findTournamentRecord({ tournamentId });
    if (result.tournamentRecord) {
      tournamentRecords.push(result.tournamentRecord);
    }
  }
  return tournamentRecords ?? [];
}
