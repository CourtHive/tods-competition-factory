import tournamentEngine from '@Engines/syncEngine';
import { expect, test } from 'vitest';

// Constants
import { INVALID_DATE } from '@Constants/errorConditionConstants';

test('can create a tournamentRecord', () => {
  let result = tournamentEngine.createTournamentRecord();
  expect(result.tournamentId).toBeDefined();
  result = tournamentEngine.createTournamentRecord({ tournamentName: 'Tournament Name' });
  expect(result.tournamentName).toEqual('Tournament Name');
  expect(result.tournamentId).toBeDefined();
  result = tournamentEngine.createTournamentRecord({ startDate: 'foo' });
  expect(result.error).toEqual(INVALID_DATE);
});
