import { competitionEngine } from '../../competitionEngine/sync';
import { mocksEngine } from '../../mocksEngine/index';
import { expect, test } from 'vitest';
import { scaleEngine } from '../sync';

import { MISSING_TOURNAMENT_RECORD } from '../../constants/errorConditionConstants';

test('basic engine methods', () => {
  const { tournamentRecord } = mocksEngine.generateTournamentRecord();
  scaleEngine.setState(tournamentRecord);

  const version = scaleEngine.version();
  expect(version).not.toBeUndefined();

  let result: any = scaleEngine.getState();
  expect(result.tournamentRecord).not.toBeUndefined();

  result = scaleEngine.reset();
  expect(result.success).toEqual(true);

  result = scaleEngine.setTournamentId(tournamentRecord.tournamentId);
  expect(result.error).toEqual(MISSING_TOURNAMENT_RECORD);

  result = scaleEngine.setState(tournamentRecord);
  expect(result.success).toEqual(true);

  result = scaleEngine.getState({ convertExtensions: true });
  expect(result.tournamentRecord).not.toBeUndefined();
  result = scaleEngine.getState({ removeExtensions: true });
  expect(result.tournamentRecord).not.toBeUndefined();
});

test('scaleEngine can set tournamentId', () => {
  const { tournamentRecord: t1 } = mocksEngine.generateTournamentRecord();
  const { tournamentRecord: t2 } = mocksEngine.generateTournamentRecord();

  let result = competitionEngine.reset();
  expect(result.success).toEqual(true);
  result = competitionEngine.setState([t1, t2]);
  expect(result.success).toEqual(true);
  result = competitionEngine.getState();
  expect(Object.keys(result.tournamentRecords).length).toEqual(2);

  result = scaleEngine.getState();
  expect(result.tournamentRecord).toBeUndefined();

  result = scaleEngine.setTournamentId(t1.tournamentId);
  expect(result.success).toEqual(true);
  result = scaleEngine.setTournamentId(t2.tournamentId);
  expect(result.success).toEqual(true);
});
