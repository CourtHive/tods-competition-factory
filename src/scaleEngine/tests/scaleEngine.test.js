import { mocksEngine, scaleEngine } from '../../..';

import { MISSING_TOURNAMENT_RECORD } from '../../constants/errorConditionConstants';

test('basic engine methods', () => {
  const { tournamentRecord } = mocksEngine.generateTournamentRecord();
  scaleEngine.setState(tournamentRecord);

  const version = scaleEngine.version();
  expect(version).not.toBeUndefined();

  let result = scaleEngine.getState();
  expect(result.tournamentRecord).not.toBeUndefined();

  result = scaleEngine.reset();
  expect(result.success).toEqual(true);

  result = scaleEngine.setTournamentId(tournamentRecord.tournamentId);
  expect(result.error).toEqual(MISSING_TOURNAMENT_RECORD);
});
