import { tournamentEngine } from '../..';
import { expect, it } from 'vitest';
import fs from 'fs';

import { MISSING_TOURNAMENT_RECORD } from '../../constants/errorConditionConstants';

const tournamentRecordJSON = fs.readFileSync(
  './src/global/testHarness/avoidanceIssue.tods.json',
  'utf-8'
);
const tournamentRecord = JSON.parse(tournamentRecordJSON);

it('will not store sandbox tournament in state', () => {
  let result = tournamentEngine.getParticipants({
    sandboxTournament: tournamentRecord,
  });

  expect(result.participants.length).toBeGreaterThan(1);

  result = tournamentEngine.getParticipants();
  expect(result.error).toEqual(MISSING_TOURNAMENT_RECORD);
});
