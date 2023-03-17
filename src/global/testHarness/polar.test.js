import { competitionEngine, tournamentEngine } from '../..';
import { expect, it } from 'vitest';
import fs from 'fs';

it('can get competitionScheduleMatchUps', () => {
  let tournamentRecordJSON = fs.readFileSync(
    './src/global/testHarness/polar.tods.json',
    'utf-8'
  );

  let tournamentRecord = JSON.parse(tournamentRecordJSON);
  tournamentEngine.setState(tournamentRecord);

  let result = competitionEngine.competitionScheduleMatchUps();
  expect(result.dateMatchUps.length).not.toBeUndefined();

  result = tournamentEngine.allTournamentMatchUps();
  expect(result.matchUps.length).not.toBeUndefined();
});
