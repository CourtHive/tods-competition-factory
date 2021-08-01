import tournamentEngine from '../../tournamentEngine/sync';
import fs from 'fs';

const tournamentRecordJSON = fs.readFileSync(
  './src/global/testHarness/demoTournament.json',
  'utf-8'
);

const tournamentRecord = JSON.parse(tournamentRecordJSON);
tournamentEngine.setState(tournamentRecord);

it.skip('can extract matchUps', () => {
  tournamentEngine.setState(tournamentRecord);
});
