import { SUCCESS, UTF8 } from '../../common/constants/app';

import * as fs from 'fs-extra';

export async function saveTournamentRecords({ tournamentRecords }: any) {
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
