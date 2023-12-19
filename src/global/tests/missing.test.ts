import competitionEngineAsync from '../../competitionEngine/async';
import competitionEngineSync from '../../competitionEngine/sync';
import tournamentEngineAsync from '../../tournamentEngine/async';
import tournamentEngineSync from '../../examples/syncEngine';
import scaleEngineAsync from '../../scaleEngine/async';
import scaleEngineSync from '../../scaleEngine/sync';
import { expect, it } from 'vitest';

const asyncCompetitionEngine = competitionEngineAsync(true);
const asyncTournamentEngine = tournamentEngineAsync(true);
const asyncScaleEngine = scaleEngineAsync(true);

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
      } else if (result.success || result.valid) {
        const successExpected = [
          'removeUnlinkedTournamentRecords',
          'getScheduledRoundsDetails',
          'getSchedulingProfileIssues',
          'validateSchedulingProfile',
          'getMatchUpDependencies',
          'setSchedulingProfile',
          'unPublishOrderOfPlay',
          'publishOrderOfPlay',
          'getTournamentIds',
          'devContext',
          'reset',
        ].includes(method);
        if (!successExpected) console.log({ method });
        expect(successExpected).toEqual(true);
      } else if (['devContext'].includes(method)) {
        expect(result.version).not.toBeUndefined();
      } else {
        expect(result.error).not.toBeUndefined();
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
      } else if (method === 'getRoundMatchUps') {
        expect(result.roundMatchUps).toEqual({});
      } else if (
        [
          'credits',
          'version',
          'participantScheduledMatchUps',
          'getPolicyDefinitions',
        ].includes(method)
      ) {
        expect(result).not.toBeUndefined();
      } else if (method === 'getState') {
        expect(result.tournamentRecord).toBeUndefined();
      } else if (result.success || result.valid) {
        const onList = [
          'validateSchedulingProfile',
          'generateDrawDefinition',
          'getMatchUpDependencies',
          'newTournamentRecord',
          'getAppliedPolicies',
          'filterParticipants',
          'setTournamentId',
          'devContext',
          'reset',
        ].includes(method);
        if (!onList) console.log({ method, result });
        expect(onList).toEqual(true);
      } else if (Array.isArray(result)) {
        expect(result.length).toEqual(0); // filtering with no values returns no results
      } else {
        if (!result.error) console.log({ method, result });
        expect(result.error).not.toBeUndefined();
      }
    }
  }
);

it.each([scaleEngineSync, asyncScaleEngine])(
  'will return MISSING_TOURNAMENT_RECORDS for most methods if no state has been set',
  async (scaleEngine) => {
    const scaleEngineMethods = Object.keys(scaleEngine);
    for (const method of scaleEngineMethods) {
      const result = await scaleEngine[method]();
      if (!result) {
        // covers methods which are expected to return boolean
        expect([false, 0].includes(result)).toEqual(true);
      } else if (
        ['credits', 'version', 'calculateNewRatings'].includes(method)
      ) {
        expect(result).not.toBeUndefined();
      } else if (method === 'getState') {
        expect(result.tournamentRecord).toBeUndefined();
      } else if (result.success || result.valid) {
        const successExpected = ['reset', 'devContext'].includes(method);
        expect(successExpected).toEqual(true);
      } else if (['devContext'].includes(method)) {
        expect(result.version).not.toBeUndefined();
      } else {
        expect(result.error).not.toBeUndefined();
      }
    }
  }
);
