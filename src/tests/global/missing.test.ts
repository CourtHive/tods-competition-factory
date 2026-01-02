import asyncEngine from '../engines/asyncEngine';
import syncEngine from '../engines/syncEngine';
import { expect, it } from 'vitest';

it.each([syncEngine, asyncEngine])(
  'will return MISSING_TOURNAMENT_RECORDS for most methods if no state has been set',
  async (engine) => {
    const engineMethods = Object.keys(engine);
    for (const method of engineMethods) {
      if (
        [
          'createTournamentRecord',
          'getParticipantResults',
          'generateEventWithDraw',
          'validateMatchUpScore',
          'hasAttributeValues',
          'extractAttributes',
          'validateSetScore',
          'chunkSizeProfile',
          'undefinedToNull',
          'hasAttributes',
          'groupValues',
          'noNulls',
        ].includes(method)
      )
        continue;
      await engine.devContext(true).reset();
      const result = await engine[method]();
      if (!result) {
        if (['getTournamentId'].includes(method)) {
          expect(result).toBeUndefined();
        } else if (['numericSort', 'nearestPowerOf2'].includes(method)) {
          expect(result).toEqual(NaN);
        } else {
          // covers methods which are expected to return boolean or empty value
          expect([false, 0, ''].includes(result)).toEqual(true);
        }
      } else if (
        [
          'stringifyMatchUpFormat',
          'getEventPublishStatus',
          'getDrawTypeCoercion',
          'parseMatchUpFormat',
          'generateTimeCode',
          'getDevContext',
          'makeDeepCopy',
          'credits',
          'version',
        ].includes(method)
      ) {
        expect(result).toBeDefined();
      } else if (method === 'getState') {
        expect(result.tournamentRecord).toBeUndefined();
      } else if (method === 'getTournament') {
        expect(result.tournamentRecord).toBeUndefined();
      } else if (
        [
          'generateOutcomeFromScoreString',
          'visualizeScheduledMatchUps',
          'definedAttributes',
          'generateHashCode',
          'attributeFilter',
          'generateOutcome',
          'getMatchUpsMap',
          'instanceCount',
          'randomMember',
          'countValues',
          'flattenJSON',
          'createMap',
          'randomPop',
          'stringify',
          'isOdd',
          'parse',
          'UUIDS',
          'UUID',
        ].includes(method)
      ) {
        expect(result).toBeDefined();
      } else if (result.success || result.valid) {
        const successExpected = [
          'removeUnlinkedTournamentRecords',
          'participantScheduledMatchUps',
          'tieFormatGenderValidityCheck',
          'getScheduledRoundsDetails',
          'getSchedulingProfileIssues',
          'validateSchedulingProfile',
          'generateTournamentRecord',
          'getMatchUpDependencies',
          'generateParticipants',
          'getSeedingThresholds',
          'calculateWinCriteria',
          'removePersonRequests',
          'unPublishOrderOfPlay',
          'newTournamentRecord',
          'setSchedulingProfile',
          'categoryCanContain',
          'getValidGroupSizes',
          'getAppliedPolicies',
          'getVenuesAndCourts',
          'publishOrderOfPlay',
          'compareTieFormats',
          'getPersonRequests',
          'getRoundMatchUps',
          'getTournamentIds',
          'getPublishState',
          'setTournamentId',
          'getScaleValues',
          'analyzeScore',
          'devContext',
          'reset',
        ].includes(method);
        if (!successExpected) console.log('success expected', { method, result });
        expect(successExpected).toEqual(true);
      } else if (Array.isArray(result)) {
        const expectResultLength = ['courtGenerator'];
        if (!expectResultLength.includes(method)) {
          expect(result.length).toEqual(0); // filtering with no values returns no results
        }
      } else if (['devContext'].includes(method)) {
        expect(result.version).not.toBeUndefined();
      } else {
        if (result.info) continue;
        if (!result.error) console.log({ result, method });
        expect(result.error).not.toBeUndefined();
      }
    }
  },
);
