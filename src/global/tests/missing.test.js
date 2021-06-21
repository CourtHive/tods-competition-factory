import tournamentEngineAsync from '../../tournamentEngine/async';
import tournamentEngineSync from '../../tournamentEngine/sync';
// import drawEngineAsync from '../../drawEngine/async';
import drawEngineSync from '../../drawEngine/sync';

const asyncTournamentEngine = tournamentEngineAsync();
// const asyncDrawEngine = drawEngineAsync();

it.each([asyncTournamentEngine, tournamentEngineSync])(
  'will return MISSING_TOURNAMENT_RECORD for most methods if no state has been set',
  async (tournamentEngine) => {
    const tournamentEngineMethods = Object.keys(tournamentEngine);
    for (const method of tournamentEngineMethods) {
      await tournamentEngine.reset();
      const result = await tournamentEngine[method]();
      if (!result) {
        // covers methods which are expected to return boolean
        expect(result).toEqual(false);
      } else if (['credits', 'version'].includes(method)) {
        expect(result).not.toBeUndefined();
      } else if (method === 'getState') {
        expect(result.tournamentRecord).toBeUndefined();
      } else if (method === 'setSubscriptions') {
        expect(result.setState).not.toBeUndefined();
      } else if (result.success) {
        expect(
          ['newTournamentRecord', 'generateDrawDefinition', 'reset'].includes(
            method
          )
        ).toEqual(true);
      } else {
        expect(result.error).not.toBeUndefined();
      }
    }
  }
);

it.each([/*asyncDrawEngine,*/ drawEngineSync])(
  'will return MISSING_DRAW_DEFINITION for most methods if no state has been set',
  async (drawEngine) => {
    // it('will return MISSING_DRAW_DEFINITION for most methods if no state has been set', () => {
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
      } else if (method === 'setSubscriptions') {
        expect(result.setState).not.toBeUndefined();
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
