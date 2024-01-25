import { SUCCESS } from '../../common/constants/app';
import * as fs from 'fs-extra';

export async function removeTournamentRecords(params?: any) {
  const tournamentIds = params?.tournamentIds ?? [params?.tournamentId].filter(Boolean);
  let removed = 0;

  for (const tournamentId of tournamentIds) {
    const tournamentFile = `./src/data/fileSystem/storage/${tournamentId}.tods.json`;
    if ((await fs.existsSync(tournamentFile)) === true) {
      fs.removeSync(tournamentFile);
      removed += 1;
    }
  }

  return { ...SUCCESS, removed };
}
