import competitionEngineAsync from '../../competitionEngine/async';
import competitionEngineSync from '../../competitionEngine/sync';
import tournamentEngineAsync from '../async';
import tournamentEngineSync from '../sync';

import mocksEngine from '../../mocksEngine';

import { METHOD_NOT_FOUND } from '../../constants/errorConditionConstants';

const asyncTournamentEngine = tournamentEngineAsync(true);
const asyncCompetitionEngine = competitionEngineAsync(true);

it.each([tournamentEngineSync, asyncTournamentEngine])(
  'tournamentEngine can execute methods in a queue',
  async (tournamentEngine) => {
    let result = await tournamentEngine.newTournamentRecord();
    expect(result.success).toEqual(true);

    result = await tournamentEngine.executionQueue([
      { method: 'getTournamentInfo' },
    ]);
    expect(result.length).toEqual(1);
    expect(result[0].tournamentInfo.tournamentId).not.toBeUndefined();

    result = await tournamentEngine.executionQueue([
      { method: 'nonExistingMethod' },
      { method: 'getTournamentInfo' },
    ]);
    expect(result.error).toEqual(METHOD_NOT_FOUND);
  }
);

it.each([competitionEngineSync, asyncCompetitionEngine])(
  'competitionEngine can execute methods in a queue',
  async (competitionEngine) => {
    const { tournamentRecord } = mocksEngine.generateTournamentRecord();
    let result = competitionEngine.setState(tournamentRecord);
    expect(result.success).toEqual(true);

    result = await competitionEngine.executionQueue([
      { method: 'getCompetitionDateRange' },
    ]);
    expect(result.length).toEqual(1);
    expect(result[0].startDate).not.toBeUndefined();
    expect(result[0].endDate).not.toBeUndefined();

    result = await competitionEngine.executionQueue([
      { method: 'nonExistingMethod' },
      { method: 'getCompetitionDateRange' },
    ]);
    expect(result.error).toEqual(METHOD_NOT_FOUND);
  }
);
