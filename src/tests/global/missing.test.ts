import asyncEngine from '../engines/asyncEngine';
import syncEngine from '../engines/syncEngine';
import { expect, it } from 'vitest';

function handleMethodResult(method: string, result: any) {
  const undefinedMethods = ['getTournamentId'];
  const nanMethods = ['numericSort', 'nearestPowerOf2'];
  const definedMethods = [
    'stringifyMatchUpFormat',
    'getEventPublishStatus',
    'getDrawTypeCoercion',
    'parseMatchUpFormat',
    'generateTimeCode',
    'getDevContext',
    'makeDeepCopy',
    'credits',
    'version',
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
    'getSetScoreString',
    'validateMatchUp',
    'createMatchUp',
    'validateSet',
    'isOdd',
    'parse',
    'UUIDS',
    'UUID',
  ];
  const successExpectedMethods = [
    'removeUnlinkedTournamentRecords',
    'participantScheduledMatchUps',
    'tieFormatGenderValidityCheck',
    'getScheduledRoundsDetails',
    'getSchedulingProfileIssues',
    'validateSchedulingProfile',
    'generateTournamentRecord',
    'getMatchUpDependencies',
    'removeTournamentRecord',
    'generateParticipants',
    'automatedPositioning',
    'getSeedingThresholds',
    'calculateWinCriteria',
    'removePersonRequests',
    'unPublishOrderOfPlay',
    'setTournamentRecord',
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
    'validateMCPMatch',
    'getPublishState',
    'setTournamentId',
    'getScaleValues',
    'analyzeScore',
    'pbpValidator',
    'devContext',
    'setState',
    'reset',
  ];
  const expectResultLength = ['courtGenerator'];

  if (!result) {
    handleFalsyResult(method, result, undefinedMethods, nanMethods);
  } else if (definedMethods.includes(method)) {
    expect(result).toBeDefined();
  } else if (isStateMethod(method)) {
    expect(result.tournamentRecord).toBeUndefined();
  } else if (isSuccessResult(result)) {
    handleSuccessResult(method, result, successExpectedMethods);
  } else if (Array.isArray(result)) {
    handleArrayResult(method, result, expectResultLength);
  } else if (['devContext'].includes(method)) {
    expect(result.version).not.toBeUndefined();
  } else {
    handleOtherResult(result, method);
  }
}

function handleFalsyResult(method: string, result: any, undefinedMethods: string[], nanMethods: string[]) {
  if (undefinedMethods.includes(method)) {
    expect(result).toBeUndefined();
  } else if (nanMethods.includes(method)) {
    expect(result).toEqual(Number.NaN);
  } else {
    expect([false, 0, ''].includes(result)).toEqual(true);
  }
}

function isStateMethod(method: string) {
  return method === 'getState' || method === 'getTournament';
}

function isSuccessResult(result: any) {
  return result.success || result.valid || result.isValid;
}

function handleSuccessResult(method: string, result: any, successExpectedMethods: string[]) {
  const successExpected = successExpectedMethods.includes(method);
  if (!successExpected) console.log('success expected', { method, result });
  expect(successExpected).toEqual(true);
}

function handleArrayResult(method: string, result: any[], expectResultLength: string[]) {
  if (!expectResultLength.includes(method)) {
    expect(result.length).toEqual(0);
  }
}

function handleOtherResult(result: any, method: string) {
  if (result.info) return;
  if (!result.error) console.log({ result, method });
  expect(result.error).not.toBeUndefined();
}

const skipMethods = new Set([
  'createTournamentRecord',
  'getParticipantResults',
  'generateEventWithDraw',
  'validateMatchUpScore',
  'hasAttributeValues',
  'extractAttributes',
  'exportMatchUpJSON',
  'validateSetScore',
  'chunkSizeProfile',
  'undefinedToNull',
  'hasAttributes',
  'groupByMatch',
  'shotParser',
  'pointParser',
  'analyzeSequence',
  'ScoringEngine',

  'parseMCPPoint',
  'mcpValidator',
  'groupValues',
  'mcpParser',
  'addPoint',
  'resolvePointValue',
  'calculatePointsTo',
  'inferServeSide',
  'getScore',
  'getScoreboard',
  'getWinner',
  'deduceMatchUpFormat',
  'noNulls',
]);

it.each([syncEngine, asyncEngine])(
  'will return MISSING_TOURNAMENT_RECORDS for most methods if no state has been set',
  async (engine) => {
    const engineMethods = Object.keys(engine);
    for (const method of engineMethods) {
      if (skipMethods.has(method)) continue;
      await engine.devContext(true).reset();
      const result = await engine[method]();
      handleMethodResult(method, result);
    }
  },
);
