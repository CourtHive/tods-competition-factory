import { competitionEngine, tournamentEngine } from '../..';
import { expect, it } from 'vitest';
import fs from 'fs';

it('can schedule', () => {
  let tournamentRecordJSON = fs.readFileSync(
    './src/global/testHarness/schedulingTournament.tods.json',
    'utf-8'
  );

  let tournamentRecord = JSON.parse(tournamentRecordJSON);
  tournamentEngine.setState(tournamentRecord);

  const { schedulingProfile } = competitionEngine.getSchedulingProfile();
  expect(schedulingProfile).not.toBeUndefined();

  const result = competitionEngine.scheduleProfileRounds();
  expect(result.success).toEqual(true);
});
