import tournamentEngine from '../engines/syncEngine';
import { expect, it } from 'vitest';

import { MISSING_TOURNAMENT_RECORD } from '../../constants/errorConditionConstants';

import tournamentRecord from './avoidanceIssue.tods.json';

it('will not store sandbox tournament in state', () => {
  let result = tournamentEngine.getParticipants({
    sandboxTournament: tournamentRecord,
  });

  expect(result.participants.length).toBeGreaterThan(1);

  result = tournamentEngine.getParticipants();
  expect(result.error).toEqual(MISSING_TOURNAMENT_RECORD);
});
