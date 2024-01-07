import { SUCCESS } from '../../common/constants/app';
import * as fs from 'fs-extra';

export async function removeTournamentRecords(params?: any) {
  const tournamentIds = params?.tournamentIds ?? [params?.tournamentId].filter(Boolean);
  for (const tournamentId of tournamentIds) {
    fs.removeSync(`./src/data/fileSystem/storage/${tournamentId}.tods.json`);
  }

  return { ...SUCCESS };
}
