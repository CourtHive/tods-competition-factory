import competitionEngineAsync from '../../competitionEngine/async';
import competitionEngineSync from '../../competitionEngine/sync';
import tournamentEngineAsync from '../async';
import tournamentEngineSync from '../sync';

import mocksEngine from '../../mocksEngine';

import { METHOD_NOT_FOUND } from '../../constants/errorConditionConstants';
import { INDIVIDUAL, PAIR } from '../../constants/participantTypes';
import { DOUBLES } from '../../constants/eventConstants';

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

it.each([tournamentEngineSync, asyncTournamentEngine])(
  'tournamentEngine processes executionQueue params',
  async (tournamentEngine) => {
    const drawProfiles = [{ drawSize: 32, eventType: DOUBLES }];
    const { tournamentRecord } = await mocksEngine.generateTournamentRecord({
      drawProfiles,
    });
    await tournamentEngine.setState(tournamentRecord);
    let result = await tournamentEngine.executionQueue([
      {
        method: 'getTournamentParticipants',
        params: { participantFilters: { participantTypes: [PAIR] } },
      },
      {
        method: 'getTournamentParticipants',
        params: { participantFilters: { participantTypes: [INDIVIDUAL] } },
      },
    ]);
    expect(result[0].tournamentParticipants.length).toEqual(32);
    expect(result[1].tournamentParticipants.length).toEqual(64);
  }
);

it.only.each([competitionEngineSync, asyncCompetitionEngine])(
  'competitionEngine processes executionQueue params',
  async (competitionEngine) => {
    const drawProfiles = [{ drawSize: 32, eventType: DOUBLES }];
    const { tournamentRecord } = await mocksEngine.generateTournamentRecord({
      drawProfiles,
    });
    await competitionEngine.setState(tournamentRecord);
    let result = await competitionEngine.executionQueue([
      {
        method: 'getCompetitionParticipants',
        params: { participantFilters: { participantTypes: [PAIR] } },
      },
      {
        method: 'getCompetitionParticipants',
        params: { participantFilters: { participantTypes: [INDIVIDUAL] } },
      },
    ]);
    expect(result[0].competitionParticipants.length).toEqual(32);
    expect(result[1].competitionParticipants.length).toEqual(64);
  }
);
