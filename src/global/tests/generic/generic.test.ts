import tournamentEngine from '../../../tournamentEngine/sync';
import { expect, test } from 'vitest';
import fs from 'fs';

/**
 * To reproduce use cases:
 * Paste snapshot of tournamentRecord into co-located tournament.tods.json file
 * Capture { method, params } and paste into methods array
 */

test.skip('can execute abitrary methods', () => {
  const tournamentRecordJSON = fs.readFileSync(
    './src/global/tests/generic/tournament.tods.json',
    'utf-8'
  );
  const tournamentRecord = JSON.parse(tournamentRecordJSON);
  let result = tournamentEngine
    .devContext(true)
    .setState(tournamentRecord, false);
  expect(result.success).toEqual(true);

  // START: preMutation
  // END: preMutation

  const methods = [];
  result = tournamentEngine.executionQueue(methods);
  console.log(result);
  // expect(result.success).toEqual(true);

  // START: postMutation
  // END: postMutation
});
