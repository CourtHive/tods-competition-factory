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
  let result = tournamentEngine.getTournamentParticipants({
    sandboxTournament: tournamentRecord,
  });

  expect(result.tournamentParticipants.length).toBeGreaterThan(1);

  result = tournamentEngine.getTournamentParticipants();
  expect(result.error).toEqual(MISSING_TOURNAMENT_RECORD);
});
