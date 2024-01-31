import * as fs from 'fs-extra';

// constants
import { TournamentRecords } from '@Types/factoryTypes';
import { SUCCESS } from '@Constants/resultConstants';
import { Tournament } from '@Types/tournamentTypes';
import { UTF8 } from '../../common/constants/app';

export async function saveTournamentRecords(params?: {
  tournamentRecords?: TournamentRecords;
  tournamentRecord?: Tournament;
}) {
  const tournamentRecords =
    params?.tournamentRecords ??
    (params?.tournamentRecord ? { [params.tournamentRecord.tournamentId]: params.tournamentRecord } : {});

  fs.ensureDirSync(`./src/data/fileSystem/storage`);

  // TODO: ensure valid tournamentRecords
  for (const tournamentId of Object.keys(tournamentRecords)) {
    const content = JSON.stringify(tournamentRecords[tournamentId], null, 2);
    const tournamentFile = `./src/data/fileSystem/storage/${tournamentId}.tods.json`;
    fs.writeFileSync(tournamentFile, content, UTF8, (err) => {
      if (err) console.log(`error: ${err}`);
    });
  }

  return { ...SUCCESS };
}
