import tournamentEngine from '../../tests/engines/syncEngine';
import { expect, it } from 'vitest';
import fs from 'fs';

it('can get competitionScheduleMatchUps', () => {
  const tournamentRecordJSON = fs.readFileSync(
    './src/global/testHarness/publishState.tods.json',
    'utf-8'
  );

  const tournamentRecord = JSON.parse(tournamentRecordJSON);
  tournamentEngine.setState(tournamentRecord);

  let result = tournamentEngine.competitionScheduleMatchUps();
  expect(result.dateMatchUps.length).toEqual(29);

  result = tournamentEngine.competitionScheduleMatchUps({
    usePublishState: true,
  });
  expect(result.dateMatchUps.length).toEqual(0);
});
