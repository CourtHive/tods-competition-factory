import competitionEngineAsync from '../../competitionEngine/async';
import competitionEngineSync from '../../competitionEngine/sync';
import tournamentEngineAsync from '../../tournamentEngine/async';
import tournamentEngineSync from '../../tournamentEngine/sync';
import scaleEngineAsync from '../../scaleEngine/async';
import scaleEngineSync from '../../scaleEngine/sync';
import drawEngineAsync from '../../drawEngine/async';
import drawEngineSync from '../../drawEngine/sync';
import { expect, it } from 'vitest';

const asyncCompetitionEngine = competitionEngineAsync(true);
const asyncTournamentEngine = tournamentEngineAsync(true);
const asyncScaleEngine = scaleEngineAsync(true);
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
      } else if (method === 'getRoundMatchUps') {
        expect(result.roundMatchUps).toEqual({});
      } else if (
        ['credits', 'version', 'participantScheduledMatchUps'].includes(method)
      ) {
        expect(result).not.toBeUndefined();
      } else if (method === 'getState') {
        expect(result.tournamentRecord).toBeUndefined();
      } else if (result.success || result.valid) {
        const onList = [
          'validateSchedulingProfile',
          'generateDrawDefinition',
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

it.each([asyncDrawEngine, drawEngineSync])(
  'will return MISSING_DRAW_DEFINITION for most methods if no state has been set',
  async (drawEngine) => {
    const drawEngineMethods = Object.keys(drawEngine);
    for (const method of drawEngineMethods) {
      await drawEngine.reset();
      const result = await drawEngine[method]();
      if (!result) {
        if (
          ![
            'stringifyMatchUpFormat',
            'parseMatchUpFormat',
            'scoreHasValue',
          ].includes(method)
        ) {
          expect([0, false].includes(result)).toEqual(true);
        }
      } else if (result.success) {
        const onList = [
          'addVoluntaryConsolationStructure',
          'addVoluntaryConsolationStage',
          'getSeedingThresholds',
          'getValidGroupSizes',
          'newDrawDefinition',
          'getSeedBlocks',
          'assignSeed',
          'reset',
        ].includes(method);
        if (!onList) console.log({ method, result });
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

it.each([scaleEngineSync, asyncScaleEngine])(
  'will return MISSING_TOURNAMENT_RECORDS for most methods if no state has been set',
  async (scaleEngine) => {
    const scaleEngineMethods = Object.keys(scaleEngine);
    for (const method of scaleEngineMethods) {
      await scaleEngine.reset();
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
