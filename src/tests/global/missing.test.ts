import asyncEngine from '../engines/asyncEngine';
import syncEngine from '../engines/syncEngine';
import { expect, it } from 'vitest';

it.each([syncEngine, asyncEngine])(
  'will return MISSING_TOURNAMENT_RECORDS for most methods if no state has been set',
  async (competitionEngine) => {
    const competitionEngineMethods = Object.keys(competitionEngine);
    for (const method of competitionEngineMethods) {
      await competitionEngine.reset();
      const result = await competitionEngine[method]();
      if (!result) {
        if (['getTournamentId'].includes(method)) {
          expect(result).toBeUndefined();
        } else {
          // covers methods which are expected to return boolean
          expect([false, 0].includes(result)).toEqual(true);
        }
      } else if (
        [
          'credits',
          'version',
          'parseMatchUpFormat',
          'stringifyMatchUpFormat',
          'getDrawTypeCoercion',
        ].includes(method)
      ) {
        expect(result).not.toBeUndefined();
      } else if (method === 'getState') {
        expect(result.tournamentRecord).toBeUndefined();
      } else if (method === 'getTournament') {
        expect(result.tournamentRecord).toBeUndefined();
      } else if (result.success || result.valid) {
        const successExpected = [
          'removeUnlinkedTournamentRecords',
          'participantScheduledMatchUps',
          'tieFormatGenderValidityCheck',
          'getScheduledRoundsDetails',
          'getSchedulingProfileIssues',
          'validateSchedulingProfile',
          'getMatchUpDependencies',
          'getSeedingThresholds',
          'calculateWinCriteria',
          'removePersonRequests',
          'unPublishOrderOfPlay',
          'categoryCanContain',
          'getValidGroupSizes',
          'newTournamentRecord',
          'setSchedulingProfile',
          'getAppliedPolicies',
          'getVenuesAndCourts',
          'publishOrderOfPlay',
          'compareTieFormats',
          'getPersonRequests',
          'getScaleValues',
          'getRoundMatchUps',
          'getTournamentIds',
          'setTournamentId',
          'devContext',
          'reset',
        ].includes(method);
        if (!successExpected)
          console.log('success expected', { method, result });
        expect(successExpected).toEqual(true);
      } else if (Array.isArray(result)) {
        expect(result.length).toEqual(0); // filtering with no values returns no results
      } else if (['devContext'].includes(method)) {
        expect(result.version).not.toBeUndefined();
      } else {
        if (result.info) continue;
        if (!result.error) console.log({ result, method });
        expect(result.error).not.toBeUndefined();
      }
    }
  }
);
