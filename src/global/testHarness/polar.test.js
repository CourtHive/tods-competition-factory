import { competitionEngine, tournamentEngine } from '../..';
import fs from 'fs';

it('can get competitionScheduleMatchUps', () => {
  let tournamentRecordJSON = fs.readFileSync(
    './src/global/testHarness/polar.tods.json',
    'utf-8'
  );

  let tournamentRecord = JSON.parse(tournamentRecordJSON);
  tournamentEngine.setState(tournamentRecord);

  competitionEngine.competitionScheduleMatchUps();

  tournamentEngine.allTournamentMatchUps();
});
