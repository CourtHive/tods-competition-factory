import {
  setStateProvider,
  tournamentEngineAsync,
} from '../dist/tods-competition-factory.esm';

import asyncGlobalState from '../src/global/examples/asyncGlobalState';

/**
 * Example of how to use asyncGlobalState
 */

const ssp = setStateProvider(asyncGlobalState);
const asyncTournamentEngine = tournamentEngineAsync();

it('can setStateProvier', async () => {
  // expect setting state provider to have succeeded
  expect(ssp.success).toEqual(true);

  let result = await asyncTournamentEngine.newTournamentRecord();
  expect(result.success).toEqual(true);
  expect(result.tournamentId).not.toBeUndefined();
});
