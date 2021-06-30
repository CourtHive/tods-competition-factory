import tournamentEngine from '../sync';

import { METHOD_NOT_FOUND } from '../../constants/errorConditionConstants';

it('can execute methods in a queue', () => {
  let result = tournamentEngine.newTournamentRecord();
  expect(result.success).toEqual(true);

  result = tournamentEngine.executionQueue([{ method: 'getTournamentInfo' }]);
  expect(result.length).toEqual(1);
  expect(result[0].tournamentInfo.tournamentId).not.toBeUndefined();

  result = tournamentEngine.executionQueue([
    { method: 'nonExistingMethod' },
    { method: 'getTournamentInfo' },
  ]);
  expect(result.error).toEqual(METHOD_NOT_FOUND);
});
