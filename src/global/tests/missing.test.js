import competitionEngineAsync from '../../competitionEngine/async';
import competitionEngineSync from '../../competitionEngine/sync';
import tournamentEngineAsync from '../../tournamentEngine/async';
import tournamentEngineSync from '../../tournamentEngine/sync';
import drawEngineAsync from '../../drawEngine/async';
import drawEngineSync from '../../drawEngine/sync';

const asyncCompetitionEngine = competitionEngineAsync(true);
const asyncTournamentEngine = tournamentEngineAsync(true);
const asyncDrawEngine = drawEngineAsync(true);

it.each([competitionEngineSync, asyncCompetitionEngine])(
  'will return MISSING_TOURNAMENT_RECORDS for most methods if no state has been set',
  async (competitionEngine) => {
    const competitionEngineMethods = Object.keys(competitionEngine);
    for (const method of competitionEngineMethods) {
      await competitionEngine.reset();
      const result = await competitionEngine[method]();
      if (!result) {
        // covers methods which are expected to return boolean
        expect([false, 0].includes(result)).toEqual(true);
      } else if (['credits', 'version'].includes(method)) {
        expect(result).not.toBeUndefined();
      } else if (method === 'getState') {
        expect(result.tournamentRecord).toBeUndefined();
      } else if (result.success) {
        expect(
          [
            'reset',
            'devContext',
            'getTournamentIds',
            'removeUnlinkedTournamentRecords',
          ].includes(method)
        ).toEqual(true);
      } else {
        if (['devContext'].includes(method)) {
          expect(result.version).not.toBeUndefined();
        } else {
          expect(result.error).not.toBeUndefined();
        }
      }
    }
  }
);

it.each([asyncTournamentEngine, tournamentEngineSync])(
  'will return MISSING_TOURNAMENT_RECORD for most methods if no state has been set',
  async (tournamentEngine) => {
    const tournamentEngineMethods = Object.keys(tournamentEngine);
    for (const method of tournamentEngineMethods) {
      await tournamentEngine.reset();
      const result = await tournamentEngine[method]();
      if (!result) {
        // covers methods which are expected to return boolean
        expect([false, 0].includes(result)).toEqual(true);
      } else if (
        ['credits', 'version', 'participantScheduledMatchUps'].includes(method)
      ) {
        expect(result).not.toBeUndefined();
      } else if (method === 'getState') {
        expect(result.tournamentRecord).toBeUndefined();
      } else if (result.success) {
        expect(
          [
            'newTournamentRecord',
            'generateDrawDefinition',
            'reset',
            'setTournamentId',
          ].includes(method)
        ).toEqual(true);
      } else {
        expect(result.error).not.toBeUndefined();
      }
    }
  }
);

it.each([asyncDrawEngine, drawEngineSync])(
  'will return MISSING_DRAW_DEFINITION for most methods if no state has been set',
  async (drawEngine) => {
    const drawEngineMethods = Object.keys(drawEngine);
    for (const method of drawEngineMethods) {
      await drawEngine.reset();
      const result = await drawEngine[method]();
      if (!result) {
        expect([0, false].includes(result)).toEqual(true);
      } else if (result.success) {
        expect(
          [
            'generateVoluntaryConsolationStructure',
            'addVoluntaryConsolationStage',
            'newDrawDefinition',
            'reset',
          ].includes(method)
        ).toEqual(true);
      } else if (['credits', 'version'].includes(method)) {
        expect(result).not.toBeUndefined();
      } else if (method === 'getState') {
        expect(result.drawDefinition).toBeUndefined();
      } else if (!result.error) {
        if (['setParticipants', 'devContext'].includes(method)) {
          expect(result.version).not.toBeUndefined();
        } else if (method === 'getNextSeedBlock') {
          expect(result.nextSeedBlock).toBeUndefined();
        } else if (method === 'tallyParticipantResults') {
          expect(result.participantResults).toEqual({});
        } else if (method === 'findMatchUp') {
          expect(result.matchUp).toBeUndefined();
        } else if (method === 'getRoundMatchUps') {
          expect(result.roundMatchUps).toEqual({});
        } else if (method === 'keyValueScore') {
          expect(result.updated).toEqual(false);
        } else {
          console.log('no error', { method, result });
        }
      }
    }
  }
);
