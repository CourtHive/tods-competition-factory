import tournamentEngine from '../../test/engines/tournamentEngine';
import { competitionEngine } from '../..';
import { expect, it } from 'vitest';
import fs from 'fs';

it('can get competitionScheduleMatchUps', () => {
  const tournamentRecordJSON = fs.readFileSync(
    './src/global/testHarness/polar.tods.json',
    'utf-8'
  );

  const tournamentRecord = JSON.parse(tournamentRecordJSON);
  tournamentEngine.setState(tournamentRecord);

  let result = competitionEngine.competitionScheduleMatchUps();
  expect(result.dateMatchUps.length).not.toBeUndefined();

  result = tournamentEngine.allTournamentMatchUps();
  expect(result.matchUps.length).not.toBeUndefined();
});
